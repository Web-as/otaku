import RestrictedWrapper from '../../components/auth/RestrictedWrapper';

export default function VnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RestrictedWrapper>{children}</RestrictedWrapper>;
}
