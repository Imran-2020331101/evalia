const TitleParagraphSkeleton = () => {
  return (
    <div className=" space-y-3">
      {/* Title */}
      <div className="h-6 bg-gray-800 rounded w-1/2"></div>

      {/* Paragraph lines */}
      <div className="h-4 bg-gray-800 rounded w-full"></div>
      <div className="h-4 bg-gray-800 rounded w-5/6"></div>
      <div className="h-4 bg-gray-800 rounded w-4/6"></div>
    </div>
  );
};

export default TitleParagraphSkeleton;
