"use client";

import { useId, useState, useEffect } from "react";
import { Tag, TagInput } from "emblor";
import { cn } from "@/lib/utils";
import { inputVariants } from "../ui/input";
import { badgeButtonVariants, badgeVariants } from "../ui/badge";

interface FormTagInputProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

function optionsToTags(options: string[]): Tag[] {
  return options
    .map((option) => option.trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: `${index}-${text}`,
      text,
    }));
}

export default function FormTagInput({
  value = [],
  onChange,
  placeholder = "Type an option and press Enter",
  disabled = false,
}: FormTagInputProps) {
  const id = useId();
  const [tags, setTags] = useState<Tag[]>(() => optionsToTags(value));
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const valueKey = (value ?? []).join("\u0001");

  useEffect(() => {
    setTags(optionsToTags(value ?? []));
  }, [valueKey]);

  const handleTagsChange = (newTags: React.SetStateAction<Tag[]>) => {
    const updatedTags = typeof newTags === "function" ? newTags(tags) : newTags;
    setTags(updatedTags);
    onChange?.(
      updatedTags
        .map((tag) => tag.text.trim())
        .filter(Boolean)
    );
  };

  return (
    <TagInput
      id={id}
      tags={tags}
      setTags={handleTagsChange}
      placeholder={placeholder}
      disabled={disabled}
      styleClasses={{
        tagList: {
          container: "gap-1",
        },
        input: cn(inputVariants({ variant: "lg" })),
        tag: {
          body: cn(badgeVariants({ variant: "outline" })),
          closeButton: cn(badgeButtonVariants()),
        },
      }}
      activeTagIndex={activeTagIndex}
      setActiveTagIndex={setActiveTagIndex}
      inlineTags={false}
      inputFieldPosition="top"
    />
  );
}
