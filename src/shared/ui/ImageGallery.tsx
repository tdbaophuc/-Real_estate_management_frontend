import { EmptyState } from "./EmptyState";

type GalleryImage = {
  alt?: string;
  id: string | number;
  url: string;
};

type ImageGalleryProps = {
  images: GalleryImage[];
};

export function ImageGallery({ images }: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <EmptyState
        title="No images"
        description="Images added to this record will appear here."
      />
    );
  }

  return (
    <div className="image-gallery">
      {images.map((image) => (
        <figure key={image.id}>
          <img src={image.url} alt={image.alt ?? "Property"} />
        </figure>
      ))}
    </div>
  );
}

