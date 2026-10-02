"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderTree,
  Gavel,
  Loader2,
  Plus,
  RefreshCw,
  Scale,
  UploadCloud,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { caseService } from "@/services/case.service";
import { documentService } from "@/services/document.service";
import { queryKeys, useClients, useCreateClient, useNextCaseNumber } from "@/hooks/use-api";
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
import { Badge } from "@/components/ui/badge";

const caseSchema = z.object({
  caseNumber: z.string().trim().min(1, "Dosya numarası zorunludur"),
  title: z.string().trim().min(3, "Dava başlığı en az 3 karakter olmalıdır"),
  category: z.string().trim().min(1, "Kategori seçiniz"),
  court: z.string().trim().min(1, "Mahkeme bilgisi zorunludur"),
  courtBasisNumber: z.string().trim().optional(),
  decisionNumber: z.string().trim().optional(),
  clientId: z.string().min(1, "Müvekkil seçimi zorunludur"),
  clientRole: z.string(),
  counterpartyName: z.string().trim().optional(),
  counterpartyLawyer: z.string().trim().optional(),
  claimAmount: z.string().optional(),
  hasSubjectVehicle: z.boolean(),
  vehiclePlate: z.string().trim().optional(),
  vehicleInfo: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

type CaseFormValues = z.infer<typeof caseSchema>;

const CATEGORY_OPTIONS = [
  "Tazminat & Sigorta",
  "İş Hukuku",
  "Ticaret Hukuku",
  "Tüketici Hukuku",
  "Gayrimenkul & Kira",
  "Ceza Hukuku",
  "İcra & İflas",
  "Aile Hukuku",
  "İdare & Vergi",
  "Diğer",
];

const CLIENT_ROLES = [
  { value: "DAVACI", label: "Davacı" },
  { value: "DAVALI", label: "Davalı" },
  { value: "MÜDAHİL", label: "Müdahil" },
  { value: "ŞİKAYETÇİ", label: "Şikayetçi / Müşteki" },
  { value: "ALACAKLI", label: "İcra Alacaklısı" },
  { value: "BORÇLU", label: "İcra Borçlusu" },
];

export function CreateCaseDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showQuickAddClient, setShowQuickAddClient] = useState(false);
  const [quickClientName, setQuickClientName] = useState("");
  const [quickClientEmail, setQuickClientEmail] = useState("");
  const [quickClientPhone, setQuickClientPhone] = useState("");
  const [quickClientTaxNumber, setQuickClientTaxNumber] = useState("");
  const [quickClientType, setQuickClientType] = useState<"INDIVIDUAL" | "CORPORATE">("INDIVIDUAL");

  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: clientsData, isLoading: isLoadingClients } = useClients();
  const createClientMutation = useCreateClient();
  const { data: nextNumber, refetch: refetchNextNumber, isFetching: isFetchingNumber } =
    useNextCaseNumber(open);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      caseNumber: "",
      title: "",
      category: "Tazminat & Sigorta",
      court: "",
      courtBasisNumber: "",
      decisionNumber: "",
      clientId: "",
      clientRole: "DAVACI",
      counterpartyName: "",
      counterpartyLawyer: "",
      claimAmount: "",
      hasSubjectVehicle: false,
      vehiclePlate: "",
      vehicleInfo: "",
      description: "",
    },
  });

  const formValues = watch();

  useEffect(() => {
    if (nextNumber && !formValues.caseNumber) {
      setValue("caseNumber", nextNumber);
    }
  }, [nextNumber, formValues.caseNumber, setValue]);

  // Canlı Klasör İsimlendirme Önizlemesi
  const computedFolderName = useMemo(() => {
    const parts: string[] = [];
    const caseNum = formValues.caseNumber?.trim() || "2026/001";
    parts.push(caseNum);

    if (formValues.hasSubjectVehicle && formValues.vehiclePlate?.trim()) {
      parts.push(formValues.vehiclePlate.trim().toUpperCase());
    }

    const selectedClient = clientsData?.clients?.find((c) => c.id === formValues.clientId);
    parts.push(selectedClient ? selectedClient.name : "Müvekkil");

    const hasBasis = !!formValues.courtBasisNumber?.trim();
    const hasCourt = !!formValues.court?.trim();

    if (hasCourt && hasBasis) {
      parts.push(`${formValues.court.trim()} ${formValues.courtBasisNumber?.trim()}`);
    } else if (hasBasis) {
      parts.push(formValues.courtBasisNumber?.trim() || "");
    } else if (hasCourt) {
      parts.push(`${formValues.court.trim()} [Esas Bekleniyor]`);
    } else {
      parts.push("[Esas Bekleniyor]");
    }

    let result = parts.join(" - ");
    if (formValues.decisionNumber?.trim()) {
      result += ` (K: ${formValues.decisionNumber.trim()})`;
    }
    return result;
  }, [
    formValues.caseNumber,
    formValues.hasSubjectVehicle,
    formValues.vehiclePlate,
    formValues.clientId,
    formValues.courtBasisNumber,
    formValues.court,
    formValues.decisionNumber,
    clientsData?.clients,
  ]);

  const mutation = useMutation({
    mutationFn: async (values: CaseFormValues) => {
      const created = await caseService.create({
        caseNumber: values.caseNumber.trim(),
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        clientId: values.clientId,
        court: values.court.trim(),
        category: values.category.trim(),
        courtBasisNumber: values.courtBasisNumber?.trim() || undefined,
        decisionNumber: values.decisionNumber?.trim() || undefined,
        clientRole: values.clientRole,
        counterpartyName: values.counterpartyName?.trim() || undefined,
        counterpartyLawyer: values.counterpartyLawyer?.trim() || undefined,
        claimAmount: values.claimAmount ? parseFloat(values.claimAmount) : undefined,
        hasSubjectVehicle: values.hasSubjectVehicle,
        vehiclePlate: values.hasSubjectVehicle ? values.vehiclePlate?.trim()?.toUpperCase() : undefined,
        vehicleInfo: values.hasSubjectVehicle ? values.vehicleInfo?.trim() : undefined,
      });

      // Başlangıç evrakları seçildiyse davanın kök klasörüne yükle
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            await documentService.upload(
              file,
              { caseId: created.id },
              created.dmsRootFolderId,
            );
          } catch (uploadErr) {
            console.error("Belge yükleme uyarısı:", uploadErr);
          }
        }
      }

      return created;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cases });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Dava ve standart DMS klasörleri başarıyla oluşturuldu.");
      setOpen(false);
      reset();
      setStep(1);
      setSelectedFiles([]);
      router.push(`/cases/${created.id}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Dava oluşturulurken bir hata oluştu.");
    },
  });

  const handleNextStep = async () => {
    if (step === 1) {
      const valid = await trigger(["caseNumber", "title", "category", "court"]);
      if (valid) setStep(2);
    } else if (step === 2) {
      const valid = await trigger(["clientId", "vehiclePlate"]);
      if (valid) setStep(3);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const resetQuickClientForm = () => {
    setShowQuickAddClient(false);
    setQuickClientName("");
    setQuickClientEmail("");
    setQuickClientPhone("");
    setQuickClientTaxNumber("");
    setQuickClientType("INDIVIDUAL");
  };

  const handleQuickCreateClient = async () => {
    const trimmedName = quickClientName.trim();
    const trimmedEmail = quickClientEmail.trim();

    if (!trimmedName) {
      toast.error("Lütfen müvekkil adını veya unvanını giriniz.");
      return;
    }
    if (!trimmedEmail) {
      toast.error("Lütfen müvekkil e-posta adresini giriniz.");
      return;
    }

    try {
      const newClient = await createClientMutation.mutateAsync({
        name: trimmedName,
        email: trimmedEmail,
        phone: quickClientPhone.trim() || undefined,
        taxNumber: quickClientTaxNumber.trim() || undefined,
        type: quickClientType,
      });

      setValue("clientId", newClient.id, { shouldValidate: true });
      toast.success(`${newClient.name} müvekkil olarak eklendi ve seçildi.`);
      resetQuickClientForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Müvekkil eklenirken bir hata oluştu";
      toast.error(message);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          reset();
          setStep(1);
          setSelectedFiles([]);
          resetQuickClientForm();
          if (typeof document !== "undefined") {
            document.body.style.pointerEvents = "";
          }
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="accent">
          <Plus className="h-4 w-4" />
          Yeni Dava
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-slate-900">Yeni Dava Açılışı</DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Adım {step} / 3 — {step === 1 ? "Temel & Mahkeme Bilgileri" : step === 2 ? "Taraflar & Araç Detayı" : "Evraklar & Klasör Önizleme"}
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Adım Çubuğu */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? "bg-accent" : "bg-slate-200"}`} />
            <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? "bg-accent" : "bg-slate-200"}`} />
            <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? "bg-accent" : "bg-slate-200"}`} />
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-6 pt-2">
          {/* ADIM 1: Temel Bilgiler & Mahkeme */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="caseNumber" className="text-xs font-medium text-slate-700">
                      Büro Dosya No *
                    </Label>
                    <button
                      type="button"
                      onClick={() => {
                        refetchNextNumber().then((res) => {
                          if (res.data) setValue("caseNumber", res.data);
                        });
                      }}
                      className="text-xs text-accent hover:underline inline-flex items-center gap-1"
                    >
                      <RefreshCw className={`h-3 w-3 ${isFetchingNumber ? "animate-spin" : ""}`} />
                      Yeni No Üret
                    </button>
                  </div>
                  <Input
                    id="caseNumber"
                    placeholder="2026/001"
                    className="font-mono"
                    {...register("caseNumber")}
                  />
                  {errors.caseNumber && (
                    <p className="text-xs text-destructive">{errors.caseNumber.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-medium text-slate-700">
                    Dava Türü / Kategori *
                  </Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    {...register("category")}
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-xs text-destructive">{errors.category.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-medium text-slate-700">
                  Dava Başlığı / Konusu *
                </Label>
                <Input
                  id="title"
                  placeholder="Örn: Değer Kaybı & Maddi Tazminat Talebi"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <Gavel className="h-4 w-4 text-accent" />
                  Yargı Merci & Dosya Numaraları
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="court" className="text-xs font-medium text-slate-700">
                    Mahkeme / Hakem Heyeti Adı *
                  </Label>
                  <Input
                    id="court"
                    placeholder="Örn: İstanbul 4. Asliye Ticaret Mahkemesi"
                    {...register("court")}
                  />
                  {errors.court && (
                    <p className="text-xs text-destructive">{errors.court.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="courtBasisNumber" className="text-xs font-medium text-slate-700">
                      Esas No (Opsiyonel)
                    </Label>
                    <Input
                      id="courtBasisNumber"
                      placeholder="2026/145 E. (Henüz yoksa boş bırakın)"
                      {...register("courtBasisNumber")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="decisionNumber" className="text-xs font-medium text-slate-700">
                      Karar No (Varsa)
                    </Label>
                    <Input
                      id="decisionNumber"
                      placeholder="2026/89 K."
                      {...register("decisionNumber")}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADIM 2: Taraflar & Araç Detayı */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="clientId" className="text-xs font-medium text-slate-700">
                      Müvekkil Seçimi *
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddClient((prev) => !prev)}
                      className="text-xs font-medium text-accent hover:underline inline-flex items-center gap-1"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      {showQuickAddClient ? "Listeden Seç" : "+ Yeni Müvekkil Ekle"}
                    </button>
                  </div>
                  <select
                    id="clientId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    {...register("clientId")}
                    onChange={(e) => {
                      if (e.target.value === "__NEW_CLIENT__") {
                        setShowQuickAddClient(true);
                        setValue("clientId", "");
                      } else {
                        register("clientId").onChange(e);
                      }
                    }}
                  >
                    <option value="">
                      {isLoadingClients ? "Müvekkiller yükleniyor..." : "— Müvekkil Seçiniz —"}
                    </option>
                    <option value="__NEW_CLIENT__" className="font-semibold text-accent">
                      ➕ Listede Yoksa Yeni Müvekkil Ekle...
                    </option>
                    {clientsData?.clients?.map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.name} ({cl.type === "corporate" ? "Kurumsal" : "Bireysel"})
                      </option>
                    ))}
                  </select>
                  {errors.clientId && (
                    <p className="text-xs text-destructive">{errors.clientId.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="clientRole" className="text-xs font-medium text-slate-700">
                    Müvekkil Sıfatı
                  </Label>
                  <select
                    id="clientRole"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    {...register("clientRole")}
                  >
                    {CLIENT_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hızlı Yeni Müvekkil Ekleme Kartı */}
              {showQuickAddClient && (
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-3.5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between pb-1 border-b border-accent/20">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-accent" />
                      <span className="text-xs font-semibold text-slate-800">
                        Hızlı Yeni Müvekkil Kaydı
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={resetQuickClientForm}
                      className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                      Vazgeç
                    </button>
                  </div>

                  {/* Müvekkil Türü Seçimi */}
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="quickClientType"
                        checked={quickClientType === "INDIVIDUAL"}
                        onChange={() => setQuickClientType("INDIVIDUAL")}
                        className="text-accent focus:ring-accent"
                      />
                      Bireysel Şahıs
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="quickClientType"
                        checked={quickClientType === "CORPORATE"}
                        onChange={() => setQuickClientType("CORPORATE")}
                        className="text-accent focus:ring-accent"
                      />
                      Kurumsal Şirket
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-700 font-medium">
                        {quickClientType === "CORPORATE" ? "Şirket / Kurum Unvanı *" : "Ad Soyad *"}
                      </Label>
                      <Input
                        value={quickClientName}
                        onChange={(e) => setQuickClientName(e.target.value)}
                        placeholder={
                          quickClientType === "CORPORATE"
                            ? "Örn: Sigorta ve Finans A.Ş."
                            : "Örn: Ali Yılmaz"
                        }
                        className="h-9 text-xs bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-slate-700 font-medium">
                        E-posta Adresi *
                      </Label>
                      <Input
                        type="email"
                        value={quickClientEmail}
                        onChange={(e) => setQuickClientEmail(e.target.value)}
                        placeholder="muvekkil@ornek.com"
                        className="h-9 text-xs bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-slate-700 font-medium">
                        Telefon Numarası
                      </Label>
                      <Input
                        type="tel"
                        value={quickClientPhone}
                        onChange={(e) => setQuickClientPhone(e.target.value)}
                        placeholder="0532 000 00 00"
                        className="h-9 text-xs bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-slate-700 font-medium">
                        {quickClientType === "CORPORATE" ? "Vergi No & Vergi Dairesi" : "T.C. Kimlik No"}
                      </Label>
                      <Input
                        value={quickClientTaxNumber}
                        onChange={(e) => setQuickClientTaxNumber(e.target.value)}
                        placeholder={quickClientType === "CORPORATE" ? "1234567890" : "11 haneli TCKN"}
                        className="h-9 text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetQuickClientForm}
                      disabled={createClientMutation.isPending}
                      className="h-8 text-xs"
                    >
                      İptal
                    </Button>
                    <Button
                      type="button"
                      variant="accent"
                      size="sm"
                      onClick={handleQuickCreateClient}
                      disabled={createClientMutation.isPending}
                      className="h-8 text-xs"
                    >
                      {createClientMutation.isPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1.5" />
                          Kaydet ve Seç
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="counterpartyName" className="text-xs font-medium text-slate-700">
                    Karşı Taraf (Davalı / Davacı)
                  </Label>
                  <Input
                    id="counterpartyName"
                    placeholder="Örn: Anadolu Sigorta A.Ş. veya Şahıs Adı"
                    {...register("counterpartyName")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="counterpartyLawyer" className="text-xs font-medium text-slate-700">
                    Karşı Taraf Vekili
                  </Label>
                  <Input
                    id="counterpartyLawyer"
                    placeholder="Örn: Av. Mehmet Kaya"
                    {...register("counterpartyLawyer")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="claimAmount" className="text-xs font-medium text-slate-700">
                  Dava / Talep Değeri (₺)
                </Label>
                <Input
                  id="claimAmount"
                  type="number"
                  step="0.01"
                  placeholder="Örn: 75000"
                  {...register("claimAmount")}
                />
              </div>

              {/* Araç Bilgisi Kartı */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-accent" />
                    <div>
                      <span className="text-sm font-medium text-slate-900">Davaya Konu Araç Var mı?</span>
                      <p className="text-xs text-slate-500">
                        Değer kaybı, kaza veya hasar davalarında plaka bilgisini bağlayın.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="hasSubjectVehicle"
                    className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                    {...register("hasSubjectVehicle")}
                  />
                </div>

                {formValues.hasSubjectVehicle && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <Label htmlFor="vehiclePlate" className="text-xs font-medium text-slate-700">
                        Araç Plakası *
                      </Label>
                      <Input
                        id="vehiclePlate"
                        placeholder="34 ABC 123"
                        className="font-mono uppercase"
                        {...register("vehiclePlate", {
                          required: formValues.hasSubjectVehicle ? "Plaka zorunludur" : false,
                        })}
                      />
                      {errors.vehiclePlate && (
                        <p className="text-xs text-destructive">{errors.vehiclePlate.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="vehicleInfo" className="text-xs font-medium text-slate-700">
                        Araç Marka / Model / Yıl
                      </Label>
                      <Input
                        id="vehicleInfo"
                        placeholder="2022 Renault Megane 1.3 TCe"
                        {...register("vehicleInfo")}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ADIM 3: Evraklar & Önizleme */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Standart Klasör İsimlendirme Önizlemesi */}
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                  <FolderTree className="h-4 w-4" />
                  DMS Standart Klasör İsmi Önizlemesi
                </div>
                <p className="font-mono text-sm font-medium text-slate-900 break-all">
                  {computedFolderName}
                </p>
                <div className="pt-2 text-xs text-slate-500">
                  Dava açıldığında bu dosya altında otomatik olarak şu şablon klasörler oluşturulacaktır:
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="bg-white text-[11px]">01. Dilekçeler & Layihalar</Badge>
                    <Badge variant="outline" className="bg-white text-[11px]">02. Duruşma Tutanakları</Badge>
                    <Badge variant="outline" className="bg-white text-[11px]">03. Deliller & Belgeler</Badge>
                    <Badge variant="outline" className="bg-white text-[11px]">04. Raporlar</Badge>
                    <Badge variant="outline" className="bg-white text-[11px]">05. Karar & İlam</Badge>
                  </div>
                </div>
              </div>

              {/* Başlangıç Evrakları Yükleme */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-slate-700">
                  Başlangıç Evrakları Yükle (Dava Dilekçesi, Tensip, Ruhsat vb. - Opsiyonel)
                </Label>

                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center hover:bg-slate-50 transition-colors">
                  <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-700">
                    Dosyaları buraya bırakın veya bilgisayarınızdan seçin
                  </p>
                  <p className="text-xs text-slate-400 mt-1">PDF, Word, Excel, Görsel (Maks. 50 MB)</p>
                  <label className="mt-3 cursor-pointer">
                    <span className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs border border-slate-200 hover:bg-slate-50">
                      Dosya Seç
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />
                  </label>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-medium text-slate-500">
                      Yüklenecek Evraklar ({selectedFiles.length})
                    </span>
                    <div className="max-h-36 overflow-y-auto space-y-1.5">
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="h-3.5 w-3.5 text-accent shrink-0" />
                            <span className="truncate text-slate-800">{file.name}</span>
                            <span className="text-slate-400">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="text-slate-400 hover:text-destructive p-1"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <Button type="button" variant="outline" size="sm" onClick={() => setStep((s) => (s === 3 ? 2 : 1))}>
                <ChevronLeft className="h-4 w-4" />
                Geri
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Vazgeç
              </Button>
            )}

            {step < 3 ? (
              <Button type="button" variant="accent" size="sm" onClick={handleNextStep}>
                İlerle
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="accent"
                size="sm"
                disabled={isSubmitting || mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Dava Açılıyor...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Davayı ve Klasörleri Oluştur
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
