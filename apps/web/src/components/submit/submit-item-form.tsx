'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ImagePlus, Loader2, X } from 'lucide-react';
import {
  submitItemSchema,
  type SubmitItemInput,
  type QuickAddExtraction,
} from '@bucketboard/shared';
import type { Category } from '@bucketboard/shared';
import { submitItemAction, uploadItemImageAction } from '@/actions/items';
import { quickAddParseAction, importQuickAddImageAction } from '@/actions/quickAdd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface RetailerOption {
  id: string;
  name: string;
  slug: string;
}

export function SubmitItemForm({
  tenantSlug,
  categories,
  retailers,
}: {
  tenantSlug: string;
  categories: Category[];
  retailers: RetailerOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFileId, setImageFileId] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [importingImage, setImportingImage] = useState(false);

  const [quickAddText, setQuickAddText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [quickAddError, setQuickAddError] = useState<string | null>(null);
  const [quickAddPreview, setQuickAddPreview] = useState<QuickAddExtraction | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<SubmitItemInput>({
    resolver: zodResolver(submitItemSchema),
    defaultValues: {
      categoryId: categories[0]?.id ?? '',
      title: '',
      attributes: [],
      shopLinks: [{ url: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'shopLinks' });

  function setImage(fileId: string | null, previewUrl: string | null) {
    setImageFileId(fileId);
    setImagePreviewUrl(previewUrl);
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImagePreviewUrl(URL.createObjectURL(file));
    setImageUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const result = await uploadItemImageAction(formData);
    setImageUploading(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Upload failed.');
      setImage(null, null);
      return;
    }
    setImageFileId(result.fileId ?? null);
  }

  async function handleQuickAddAnalyze() {
    if (!quickAddText.trim()) return;
    setIsAnalyzing(true);
    setQuickAddError(null);
    setQuickAddPreview(null);
    const result = await quickAddParseAction(quickAddText);
    setIsAnalyzing(false);
    if (!result.ok || !result.data) {
      setQuickAddError(result.error ?? 'Could not analyze that.');
      return;
    }
    setQuickAddPreview(result.data);
  }

  function applyQuickAddPreview() {
    if (!quickAddPreview) return;
    if (quickAddPreview.title) setValue('title', quickAddPreview.title, { shouldValidate: true });
    if (quickAddPreview.url)
      setValue('shopLinks.0.url', quickAddPreview.url, { shouldValidate: true });
    if (quickAddPreview.price != null) setValue('shopLinks.0.price', quickAddPreview.price);
    if (quickAddPreview.categoryName) {
      const needle = quickAddPreview.categoryName.toLowerCase();
      const match = categories.find(
        (category) =>
          category.name.toLowerCase() === needle || category.name.toLowerCase().includes(needle),
      );
      if (match) setValue('categoryId', match.id);
    }
    if (quickAddPreview.imageUrl) {
      const imageUrl = quickAddPreview.imageUrl;
      setImagePreviewUrl(imageUrl);
      setImportingImage(true);
      importQuickAddImageAction(imageUrl)
        .then((result) => {
          if (result.ok && result.fileId) {
            setImageFileId(result.fileId);
          } else {
            toast.error(result.error ?? 'Could not import the image.');
          }
        })
        .finally(() => setImportingImage(false));
    }
    setQuickAddPreview(null);
    setQuickAddText('');
    toast.success('Applied — review the details below before submitting.');
  }

  function onSubmit(values: SubmitItemInput) {
    startTransition(async () => {
      const result = await submitItemAction(tenantSlug, { ...values, imageAssetId: imageFileId });
      if (!result.ok) {
        toast.error(result.error ?? 'Could not submit item.');
        return;
      }
      toast.success('Item submitted!');
      router.push(`/t/${tenantSlug}/i/${result.itemSlug}`);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Quick add</CardTitle>
          <CardDescription>
            Paste a link, or a WhatsApp-style message that contains one — we&apos;ll fetch it and
            pre-fill the details below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            rows={3}
            value={quickAddText}
            onChange={(event) => setQuickAddText(event.target.value)}
            placeholder="Paste a product link or forwarded message here…"
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isAnalyzing || !quickAddText.trim()}
              onClick={handleQuickAddAnalyze}
            >
              {isAnalyzing ? 'Analyzing…' : 'Analyze'}
            </Button>
            {quickAddError ? <p className="text-destructive text-sm">{quickAddError}</p> : null}
          </div>

          {quickAddPreview ? (
            <div className="bg-muted/50 space-y-2 rounded-lg border p-3">
              {quickAddPreview.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={quickAddPreview.imageUrl}
                  alt=""
                  className="h-32 w-32 rounded-md object-cover"
                />
              ) : null}
              <p className="text-sm font-medium">{quickAddPreview.title ?? 'Untitled'}</p>
              {quickAddPreview.price != null ? (
                <p className="text-sm">
                  {quickAddPreview.currency ?? ''} {quickAddPreview.price}
                </p>
              ) : null}
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={applyQuickAddPreview}>
                  Apply to form
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuickAddPreview(null)}
                >
                  Discard
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-1.5">
        <Label>Photo</Label>
        <input
          ref={fileInputRef}
          id="image"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleImageChange}
        />
        <div className="relative size-32">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageUploading || importingImage}
            className="border-input bg-muted hover:bg-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 flex size-32 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border border-dashed text-sm outline-none transition-colors disabled:pointer-events-none disabled:opacity-50"
          >
            {imagePreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreviewUrl} alt="" className="size-full object-cover" />
            ) : (
              <>
                <ImagePlus className="text-muted-foreground size-5" aria-hidden="true" />
                <span className="text-muted-foreground text-xs">Add photo</span>
              </>
            )}
          </button>
          {imageUploading || importingImage ? (
            <div className="bg-background/70 absolute inset-0 flex items-center justify-center rounded-xl">
              <Loader2 className="text-muted-foreground size-5 animate-spin" aria-hidden="true" />
            </div>
          ) : imagePreviewUrl ? (
            <button
              type="button"
              onClick={() => setImage(null, null)}
              aria-label="Remove photo"
              className="bg-foreground text-background absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full shadow-sm"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="e.g. Belvita Breakfast Biscuits" {...register('title')} />
        {errors.title ? <p className="text-destructive text-sm">{errors.title.message}</p> : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          {...register('categoryId')}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 h-9 w-full rounded-lg border px-2.5 text-sm outline-none"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {'—'.repeat(category.depth)} {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId ? (
          <p className="text-destructive text-sm">{errors.categoryId.message}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <Label>Where can people buy this?</Label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-wrap gap-2 rounded-lg border p-3">
            <div className="min-w-48 flex-1">
              <Input
                placeholder="https://shop.example.com/product"
                {...register(`shopLinks.${index}.url` as const)}
              />
              {errors.shopLinks?.[index]?.url ? (
                <p className="text-destructive text-sm">{errors.shopLinks[index]?.url?.message}</p>
              ) : null}
            </div>
            <select
              {...register(`shopLinks.${index}.retailerId` as const)}
              className="border-input bg-background focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 h-9 rounded-lg border px-2 text-sm outline-none"
              defaultValue=""
            >
              <option value="">Auto-detect retailer</option>
              {retailers.map((retailer) => (
                <option key={retailer.id} value={retailer.id}>
                  {retailer.name}
                </option>
              ))}
            </select>
            <Input
              placeholder="Price (optional)"
              type="number"
              step="0.01"
              className="w-32"
              {...register(`shopLinks.${index}.price` as const, { valueAsNumber: true })}
            />
            {fields.length > 1 ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                Remove
              </Button>
            ) : null}
          </div>
        ))}
        {errors.shopLinks?.message ? (
          <p className="text-destructive text-sm">{errors.shopLinks.message}</p>
        ) : null}
        <Button type="button" variant="outline" size="sm" onClick={() => append({ url: '' })}>
          Add another shop link
        </Button>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isPending || imageUploading}>
        Submit item
      </Button>
    </form>
  );
}
