interface StepHeaderProps {
  title: string;
  description?: string;
}

export function StepHeader({ title, description }: StepHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-light text-gray-700 mb-2">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500 mt-2">{description}</p>
        )}
      </div>
    </div>
  );
}
