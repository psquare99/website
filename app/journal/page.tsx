import Container from "@/components/Container";


import Notebook from "@/components/Notebook";

export default function JournalPage() {
  return (
    <main
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, #F2EEE7 0%, #EFE9DF 100%)",
      }}
    >
      <Container>

        
        <Notebook />

      </Container>
    </main>
  );
}