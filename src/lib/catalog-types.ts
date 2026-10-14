export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  color_hex: string | null;
  is_available: boolean;
};

export type ProductPhoto = {
  id: string;
  url: string;
  alt: string;
};

export type VariantActionState = {
  error: string;
  success: string;
};
