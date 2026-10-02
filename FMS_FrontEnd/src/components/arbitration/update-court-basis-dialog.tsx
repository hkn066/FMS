"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  courtBasisNumber: z.string().trim().min(1, "Esas numarası zorunludur").max(50),
});

type FormValues = z.infer<typeof schema>;

interface UpdateCourtBasisDialogProps {
  caseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateCourtBasisDialog({ caseId, open, onOpenChange }: UpdateCourtBasisDialogProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { courtBasisNumber: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      arbitrationService.update(caseId, { courtBasisNumber: values.courtBasisNumber }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.arbitrationCase(caseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.arbitrationDocuments(caseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.arbitration });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      onOpenChange(false);
      reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Esas Numarası Gir</DialogTitle>
          <DialogDescription>
            Esas numarası kaydedildiğinde klasör adı otomatik güncellenir.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="courtBasisNumber">Yargılama Esas No</Label>
            <Input id="courtBasisNumber" placeholder="2024/1234" {...register("courtBasisNumber")} />
            {errors.courtBasisNumber && (
              <p className="text-xs text-destructive">{errors.courtBasisNumber.message}</p>
            )}
          </div>
          {mutation.error && (
            <p className="text-sm text-destructive">{(mutation.error as Error).message}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" variant="accent" disabled={isSubmitting || mutation.isPending}>
              {mutation.isPending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UpdateCourtBasisButton({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" />
        Esas No Ekle
      </Button>
      <UpdateCourtBasisDialog caseId={caseId} open={open} onOpenChange={setOpen} />
    </>
  );
}
