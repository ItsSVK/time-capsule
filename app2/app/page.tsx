import BackgroundGradients from './create/components/BackgroundGradients';
export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <BackgroundGradients />

      <h1 className="text-2xl font-semibold text-foreground">Hello World</h1>
    </div>
  );
}
