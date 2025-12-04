import NavBar from "./components/NavBar";
import AppRouter from "./routes/AppRouter";

export default function App() {
  return (
    <>
      <NavBar />

      <main className="w-full max-w-screen-2xl mx-auto px-6 py-6">
        <AppRouter />
      </main>
    </>
  );
}
