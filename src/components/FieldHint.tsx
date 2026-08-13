type Props = { hint: string };

export default function FieldHint({ hint }: Props) {
  return (
    <span className="field-hint" tabIndex={0} data-hint={hint} aria-label={hint}>
      ?
    </span>
  );
}
