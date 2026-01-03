import db from '@/lib/db';

export const RatingContainer = async ({ id }: { id: string }) => {
  const ratings = await db.rating.findMany({
    where: { doctorId: id }, // match your model's field
    orderBy: { created_at: "desc" },
  });

  const totalRatings = ratings.length;
  const averageRating =
    totalRatings === 0
      ? 0
      : ratings.reduce((sum: any, r: any) => sum + r.rating, 0) / totalRatings;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Doctor Ratings</h3>
      <p className="text-sm text-gray-600">
        Average Rating: <span className="font-medium">{averageRating.toFixed(1)} / 5</span>
      </p>
      <p className="text-sm text-gray-600">Total Reviews: {totalRatings}</p>
    </div>
  );
};
