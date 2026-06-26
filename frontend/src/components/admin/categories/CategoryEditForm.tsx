"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Field, FieldLabel, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { SaveIcon, Trash2Icon } from "lucide-react";
import type { CategoryNode } from "./types";

interface CategoryEditFormProps {
  category: CategoryNode | null;
  onSave: () => void;
}

export function CategoryEditForm({ category, onSave }: CategoryEditFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setImage(category.image || "");
      setVisible(category.visible === 1);
    }
  }, [category]);

  if (!category) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full text-muted-foreground text-sm">
          Выберите категорию слева
        </CardContent>
      </Card>
    );
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: category!.id, name, slug, image: image || null, visible: visible ? 1 : 0 }),
      });
      if (!res.ok) throw new Error("Save failed");
      onSave();
    } catch {
      setError("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Удалить «${category!.name}»? Это нельзя отменить.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories?id=${category!.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      onSave();
    } catch {
      setError("Ошибка удаления");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {category.name}
          <span className="ml-2 text-xs text-muted-foreground font-normal">
            {category.gender} · id={category.id}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="cat-name">Название</FieldLabel>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="cat-slug">Slug</FieldLabel>
            <Input id="cat-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="cat-image">URL картинки</FieldLabel>
            <Input id="cat-image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="cat-visible">Видима</FieldLabel>
            <Switch id="cat-visible" checked={visible} onCheckedChange={setVisible} />
          </Field>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Separator />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? <Spinner data-icon="inline-start" /> : <SaveIcon data-icon="inline-start" />}
              Сохранить
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={saving} className="text-destructive hover:text-destructive">
              <Trash2Icon data-icon="inline-start" />
              Удалить
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
