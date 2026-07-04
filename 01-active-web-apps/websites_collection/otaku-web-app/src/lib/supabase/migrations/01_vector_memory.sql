-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store agent memories
create table if not exists public.agent_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  agent_id text not null, -- To distinguish between DM Friend, Librarian, etc.
  content text not null,
  embedding vector(384), -- Using 384 dimensions (e.g. all-MiniLM-L6-v2)
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.agent_memories enable row level security;

-- Policies
create policy "Users can read their own memories"
  on public.agent_memories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own memories"
  on public.agent_memories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own memories"
  on public.agent_memories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own memories"
  on public.agent_memories for delete
  using (auth.uid() = user_id);

-- Create an index for faster similarity searches (HNSW is recommended for pgvector >= 0.5.0)
create index on public.agent_memories using hnsw (embedding vector_cosine_ops);

-- Create a function to match memories based on cosine similarity
create or replace function match_memories (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  p_user_id uuid,
  p_agent_id text
)
returns table (
  id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    agent_memories.id,
    agent_memories.content,
    1 - (agent_memories.embedding <=> query_embedding) as similarity
  from agent_memories
  where agent_memories.user_id = p_user_id
    and agent_memories.agent_id = p_agent_id
    and 1 - (agent_memories.embedding <=> query_embedding) > match_threshold
  order by agent_memories.embedding <=> query_embedding
  limit match_count;
$$;
