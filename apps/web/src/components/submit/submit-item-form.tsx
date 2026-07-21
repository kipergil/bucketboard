'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  submitItemSchema,
  type SubmitItemInput,
  type QuickAddExtraction,
} from '@bucketboard/shared';
import type { AttributeDefinition, Category } from '@bucketboard/shared';
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
  attributeDefinitions,
  retailers,
}: {
  tenantSlug: string;
  categories: Category[];
  attributeDefinitions: AttributeDefinition[];
  retailers: RetailerOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imageFileId, setImageFileId] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const [quickAddText, setQuickAddText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [quickAddError, setQuickAddError] = useState<string | null>(null);
  const [quickAddPreview, setQuickAddPreview] = useState<QuickAddExtraction | null>(null);
  const [importingImage, setImportingImage] = useState(false);

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
      body: '',
      attributes: [],
      shopLinks: [{ url: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'shopLinks' });
  const selectedCategoryId = useWatch({ control, name: 'categoryId' });

  const relevantDefinitions = attributeDefinitions.filter(
    (def) => def.category === null || def.category === selectedCategoryId,
  );

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const result = await uploadItemImageAction(formData);
    setImageUploading(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Upload failed.');
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
    if (quickAddPreview.brand) setValue('brand', quickAddPreview.brand);
    if (quickAddPreview.body) setValue('body', quickAddPreview.body, { shouldValidate: true });
    if (quickAddPreview.url) {
      setValue('url', quickAddPreview.url);
      setValue('shopLinks.0.url', quickAddPreview.url, { shouldValidate: true });
    }
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
    toast.success('Applied — review the fields below before submitting.');
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
            pre-fill the form below.
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
              {quickAddPreview.brand ? (
                <p className="text-muted-foreground text-sm">{quickAddPreview.brand}</p>
              ) : null}
              {quickAddPreview.body ? <p className="text-sm">{quickAddPreview.body}</p> : null}
              {quickAddPreview.price != null ? (
                <p className="text-sm">
                  {quickAddPreview.currency ?? ''} {quickAddPreview.price}
                </p>
              ) : null}
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={applyQuickAddPreview}
                  disabled={importingImage}
                >
                  {importingImage ? 'Importing image…' : 'Apply to form'}
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
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          {...register('categoryId')}
          className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
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

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title')} />
        {errors.title ? <p className="text-destructive text-sm">{errors.title.message}</p> : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="brand">Brand (optional)</Label>
        <Input id="brand" {...register('brand')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="url">Reference link (optional)</Label>
        <Input id="url" type="url" {...register('url')} placeholder="https://…" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="image">Image</Label>
        <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
        {imageUploading ? <p className="text-muted-foreground text-sm">Uploading…</p> : null}
        {imageFileId ? <p className="text-sm text-green-600">Image uploaded.</p> : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">Your review</Label>
        <Textarea id="body" rows={5} {...register('body')} />
        {errors.body ? <p className="text-destructive text-sm">{errors.body.message}</p> : null}
      </div>

      {relevantDefinitions.length > 0 ? (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Details</legend>
          {relevantDefinitions.map((def, index) => (
            <div key={def.id} className="space-y-1.5">
              <Label htmlFor={`attr-${def.key}`}>{def.label}</Label>
              <input
                type="hidden"
                {...register(`attributes.${index}.definitionId` as const)}
                value={def.id}
              />
              {renderAttributeInput(def, index, register)}
            </div>
          ))}
        </fieldset>
      ) : null}

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
              className="border-input bg-background h-9 rounded-md border px-2 text-sm"
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

      <Button type="submit" disabled={isPending || imageUploading}>
        Submit item
      </Button>
    </form>
  );
}

function renderAttributeInput(
  def: AttributeDefinition,
  index: number,
  register: ReturnType<typeof useForm<SubmitItemInput>>['register'],
) {
  const name = `attributes.${index}.value` as const;
  if (def.type === 'boolean') {
    return (
      <select
        {...register(name)}
        className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
      >
        <option value="">—</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }
  if (def.type === 'select' || def.type === 'multiselect') {
    return (
      <select
        {...register(name)}
        multiple={def.type === 'multiselect'}
        className="border-input bg-background w-full rounded-md border px-2 text-sm"
      >
        {def.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
  return (
    <Input
      id={`attr-${def.key}`}
      type={def.type === 'number' ? 'number' : 'text'}
      {...register(name)}
    />
  );
}
