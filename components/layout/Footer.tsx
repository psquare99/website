import Container from "./Container";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 py-10">
      <Container>
        <div className="space-y-2 text-center text-sm text-stone-500">
          <p>Still learning.</p>
          <p>Still building.</p>

          <p className="pt-4">
            © {new Date().getFullYear()} Prateek Pal
          </p>
        </div>
      </Container>
    </footer>
  );
}