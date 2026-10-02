"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { arbitrationService } from "@/services/arbitration-service";
import { queryKeys } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const createSchema = z.object({
  licensePlate: z.string().trim().min(1, "Plaka zorunludur").max(20),
  clientNameSurname: z.string().trim().min(1, "Müvekkil ad soyad zorunludur").max(255),
  courtBasisNumber: z.string().max(50).optional(),
  arbitrationFileNumber: z.string().max(50).optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;

export function CreateArbitrationDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      licensePlate: "",
      clientNameSurname: "",
      courtBasisNumber: "",
      arbitrationFileNumber: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: CreateFormValues) =>
      arbitrationService.create({
        licensePlate: values.licensePlate,
        clientNameSurname: values.clientNameSurname,
        courtBasisNumber: values.courtBasisNumber?.trim() || undefined,
        arbitrationFileNumber: values.arbitrationFileNumber?.trim() || undefined,
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.arbitration });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setOpen(false);
      reset();
      router.push(`/arbitration/${created.id}`);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent">
          <Plus className="h-4 w-4" />
          Yeni Tahkim Dosyası
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Tahkim Dosyası</DialogTitle>
          <DialogDescription>
            Plaka ve müvekkil ad soyad zorunludur. Esas ve tahkim numarası sonradan eklenebilir.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="licensePlate">Araç Plakası *</Label>
            <Input id="licensePlate" placeholder="34 ABC 123" {...register("licensePlate")} />
            {errors.licensePlate && (
              <p className="text-xs text-destructive">{errors.licensePlate.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientNameSurname">Müvekkil Ad Soyad *</Label>
            <Input id="clientNameSurname" placeholder="Ahmet Yılmaz" {...register("clientNameSurname")} />
            {errors.clientNameSurname && (
              <p className="text-xs text-destructive">{errors.clientNameSurname.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="courtBasisNumber">Esas No</Label>
            <Input id="courtBasisNumber" placeholder="Opsiyonel" {...register("courtBasisNumber")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="arbitrationFileNumber">Tahkim Dosya No</Label>
            <Input id="arbitrationFileNumber" placeholder="Opsiyonel" {...register("arbitrationFileNumber")} />
          </div>
          {mutation.error && (
            <p className="text-sm text-destructive">{(mutation.error as Error).message}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" variant="accent" disabled={isSubmitting || mutation.isPending}>
              {mutation.isPending ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
