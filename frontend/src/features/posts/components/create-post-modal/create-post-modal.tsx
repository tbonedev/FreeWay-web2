'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';

import {
  createPostFormSchema,
  defaultValues,
  TCreatePostFormSchema,
} from './validation-schema';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icons,
  Input,
  useToast,
} from '@/components';
import { createPostAction } from '@/features/posts';

export const CreatePostModal = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<TCreatePostFormSchema>({
    resolver: zodResolver(createPostFormSchema),
    defaultValues,
  });
  const [image, setImage] = useState<File | null>();
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImage(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { 'image/jpeg': [], 'image/png': [] },
  });

  const resetImage = () => setImage(null);

  const onSubmit = async ({ content }: TCreatePostFormSchema) => {
    if (!image) return;

    const formData = new FormData();
    formData.append('image', image);
    formData.append('content', content);

    const error = await createPostAction(formData);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Oops! Something went wrong.',
        description: error.message,
      });
    }

    toast({
      title: 'Post added.',
    });

    form.reset();
    resetImage();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-4 font-normal xl:justify-start"
        >
          <Icons.plusSquare />
          <span className="hidden text-base xl:block">Create</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create post</DialogTitle>
          <DialogDescription>
            Add image and content to post. Click save when you are done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3"
          >
            <div
              className="flex flex-col items-center justify-center rounded-md border p-10 text-center"
              {...getRootProps()}
            >
              <Input id="image" {...getInputProps()} />
              <Icons.uploadClout className="text-primary size-16 stroke-1" />
              <p>Drop your image here, or browse</p>
              <span className="text-muted-foreground text-sm">
                PNG, JPG are allowed
              </span>
            </div>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Input placeholder="content" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        {image && (
          <div className="relative w-fit">
            <Image
              src={URL.createObjectURL(image)}
              className="h-40 rounded-md object-cover"
              alt="post image"
              width={500}
              height={500}
            />
            <Button
              onClick={resetImage}
              className="absolute right-2 top-2 size-6"
              variant="secondary"
              size="icon"
            >
              <Icons.x className="size-4" />
            </Button>
          </div>
        )}
        <DialogFooter className="justify-center">
          <Button form="form" type="submit" className="w-full">
            Create post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
