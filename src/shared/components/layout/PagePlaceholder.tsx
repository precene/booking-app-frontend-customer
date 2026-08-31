type PagePlaceholderProps = {
  title: string;
  description: string;
};

function PagePlaceholder({ description, title }: PagePlaceholderProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-primary text-sm font-medium tracking-wide uppercase">977Cinema</p>
        <h1 className="text-foreground mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-7">{description}</p>
      </div>
    </section>
  );
}

export { PagePlaceholder };
