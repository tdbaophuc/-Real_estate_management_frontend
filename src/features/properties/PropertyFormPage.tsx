import { useEffect, useMemo, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { z } from "zod";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import {
  getAmenities,
  getDistricts,
  getPropertyTypes,
  getProvinces,
  getWards
} from "../master-data/masterDataApi";
import {
  createProperty,
  getProperty,
  updateProperty,
  type PropertyRecord,
  type PropertyUpsertRequest
} from "./propertyApi";

const optionalNumber = z.string().trim().refine((value) => !value || !Number.isNaN(Number(value)), "Must be a number");
const requiredNumber = z.string().trim().min(1, "Required").refine((value) => !Number.isNaN(Number(value)), "Must be a number");
const dateRule = z.string().trim().refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), "Use yyyy-MM-dd");

const propertyFormSchema = z.object({
  addressLine: z.string().trim().optional(),
  amenityId: optionalNumber,
  amenityNote: z.string().trim().optional(),
  assignedAgentId: optionalNumber,
  availableFrom: dateRule,
  bathrooms: optionalNumber,
  bedrooms: optionalNumber,
  code: z.string().trim().min(2, "Code is required"),
  currency: z.string().trim().min(3, "Currency is required").max(3, "Use 3 characters"),
  description: z.string().trim().optional(),
  direction: z.string().trim().optional(),
  districtId: optionalNumber,
  floorArea: optionalNumber,
  floors: optionalNumber,
  furnitureStatus: z.string().trim().optional(),
  landArea: optionalNumber,
  latitude: optionalNumber,
  legalStatus: z.string().trim().optional(),
  longitude: optionalNumber,
  name: z.string().trim().min(2, "Name is required"),
  ownerId: optionalNumber,
  price: requiredNumber,
  propertyTypeId: requiredNumber,
  provinceId: optionalNumber,
  purpose: z.enum(["SALE", "RENT"]),
  street: z.string().trim().optional(),
  wardId: optionalNumber
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

const purposeOptions = [
  { label: "Sale", value: "SALE" },
  { label: "Rent", value: "RENT" }
];

const directionOptions = [
  { label: "Unknown", value: "" },
  { label: "North", value: "NORTH" },
  { label: "Northeast", value: "NORTHEAST" },
  { label: "East", value: "EAST" },
  { label: "Southeast", value: "SOUTHEAST" },
  { label: "South", value: "SOUTH" },
  { label: "Southwest", value: "SOUTHWEST" },
  { label: "West", value: "WEST" },
  { label: "Northwest", value: "NORTHWEST" }
];

const legalStatusOptions = [
  { label: "Unknown", value: "" },
  { label: "Pink book", value: "PINK_BOOK" },
  { label: "Red book", value: "RED_BOOK" },
  { label: "Sale contract", value: "SALE_CONTRACT" },
  { label: "Waiting for certificate", value: "WAITING_FOR_CERTIFICATE" },
  { label: "Other", value: "OTHER" }
];

const furnitureOptions = [
  { label: "Unknown", value: "" },
  { label: "Unfurnished", value: "UNFURNISHED" },
  { label: "Partially furnished", value: "PARTIALLY_FURNISHED" },
  { label: "Fully furnished", value: "FULLY_FURNISHED" }
];

function toSelectOptions(
  items: Array<{ id: number; name: string; code?: string }> | undefined,
  placeholder: string,
  currentValue?: string
) {
  const options = [
    { label: placeholder, value: "" },
    ...(items ?? []).map((item) => ({
      label: item.code ? `${item.name} (${item.code})` : item.name,
      value: String(item.id)
    }))
  ];

  if (currentValue && !options.some((option) => option.value === currentValue)) {
    options.push({ label: `Current #${currentValue}`, value: currentValue });
  }

  return options;
}

function toNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function toDefaultValues(property?: PropertyRecord): PropertyFormValues {
  return {
    addressLine: property?.address.fullAddress === "Address updating" ? "" : property?.address.fullAddress ?? "",
    amenityId: "",
    amenityNote: "",
    assignedAgentId: property?.assignedAgentId ? String(property.assignedAgentId) : "",
    availableFrom: property?.availableFrom ?? "",
    bathrooms: property?.bathrooms ? String(property.bathrooms) : "",
    bedrooms: property?.bedrooms ? String(property.bedrooms) : "",
    code: property?.code ?? "",
    currency: property?.currency ?? "VND",
    description: property?.description ?? "",
    direction: property?.direction === "UNKNOWN" ? "" : property?.direction ?? "",
    districtId: property?.address.districtId ? String(property.address.districtId) : "",
    floorArea: property?.floorArea ? String(property.floorArea) : "",
    floors: property?.floors ? String(property.floors) : "",
    furnitureStatus: property?.furnitureStatus === "UNKNOWN" ? "" : property?.furnitureStatus ?? "",
    landArea: property?.landArea ? String(property.landArea) : "",
    latitude: property?.address.latitude ? String(property.address.latitude) : "",
    legalStatus: property?.legalStatus === "UNKNOWN" ? "" : property?.legalStatus ?? "",
    longitude: property?.address.longitude ? String(property.address.longitude) : "",
    name: property?.name ?? "",
    ownerId: property?.ownerId ? String(property.ownerId) : "",
    price: property?.price ? String(property.price) : "",
    propertyTypeId: property?.propertyTypeId ? String(property.propertyTypeId) : "",
    provinceId: property?.address.provinceId ? String(property.address.provinceId) : "",
    purpose: property?.purpose ?? "SALE",
    street: "",
    wardId: property?.address.wardId ? String(property.address.wardId) : ""
  };
}

function toRequest(values: PropertyFormValues): PropertyUpsertRequest {
  const amenityId = toNumber(values.amenityId);

  return {
    address: {
      addressLine: values.addressLine || undefined,
      districtId: toNumber(values.districtId),
      latitude: toNumber(values.latitude),
      longitude: toNumber(values.longitude),
      provinceId: toNumber(values.provinceId),
      street: values.street || undefined,
      wardId: toNumber(values.wardId)
    },
    amenities: amenityId
      ? [
          {
            amenityId,
            note: values.amenityNote || undefined
          }
        ]
      : [],
    assignedAgentId: toNumber(values.assignedAgentId),
    availableFrom: values.availableFrom || undefined,
    bathrooms: toNumber(values.bathrooms),
    bedrooms: toNumber(values.bedrooms),
    code: values.code.trim(),
    currency: values.currency.trim().toUpperCase(),
    description: values.description || undefined,
    direction: values.direction || undefined,
    floorArea: toNumber(values.floorArea),
    floors: toNumber(values.floors),
    furnitureStatus: values.furnitureStatus || undefined,
    landArea: toNumber(values.landArea),
    legalStatus: values.legalStatus || undefined,
    name: values.name.trim(),
    ownerId: toNumber(values.ownerId),
    price: Number(values.price),
    propertyTypeId: Number(values.propertyTypeId),
    purpose: values.purpose
  };
}

function FormSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="form-section">
      <h3>{title}</h3>
      <div className="form-grid">{children}</div>
    </section>
  );
}

export function PropertyFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [formError, setFormError] = useState<string | null>(null);
  const propertyQuery = useQuery({
    enabled: isEditMode,
    queryFn: () => getProperty(id ?? ""),
    queryKey: ["property", id],
    retry: 1
  });
  const defaultValues = useMemo(() => toDefaultValues(propertyQuery.data), [propertyQuery.data]);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch
  } = useForm<PropertyFormValues>({
    defaultValues,
    resolver: zodResolver(propertyFormSchema)
  });
  const selectedProvinceId = watch("provinceId");
  const selectedDistrictId = watch("districtId");
  const propertyTypesQuery = useQuery({
    queryFn: getPropertyTypes,
    queryKey: ["master-data", "property-types"],
    retry: 1,
    staleTime: 5 * 60 * 1000
  });
  const provincesQuery = useQuery({
    queryFn: getProvinces,
    queryKey: ["master-data", "provinces"],
    retry: 1,
    staleTime: 5 * 60 * 1000
  });
  const districtsQuery = useQuery({
    enabled: Boolean(selectedProvinceId),
    queryFn: () => getDistricts(selectedProvinceId),
    queryKey: ["master-data", "districts", selectedProvinceId],
    retry: 1,
    staleTime: 5 * 60 * 1000
  });
  const wardsQuery = useQuery({
    enabled: Boolean(selectedDistrictId),
    queryFn: () => getWards(selectedDistrictId),
    queryKey: ["master-data", "wards", selectedDistrictId],
    retry: 1,
    staleTime: 5 * 60 * 1000
  });
  const amenitiesQuery = useQuery({
    queryFn: () => getAmenities(),
    queryKey: ["master-data", "amenities"],
    retry: 1,
    staleTime: 5 * 60 * 1000
  });
  const propertyTypeOptions = useMemo(
    () => toSelectOptions(propertyTypesQuery.data, "Select property type", defaultValues.propertyTypeId),
    [defaultValues.propertyTypeId, propertyTypesQuery.data]
  );
  const provinceOptions = useMemo(
    () => toSelectOptions(provincesQuery.data, "Select province", defaultValues.provinceId),
    [defaultValues.provinceId, provincesQuery.data]
  );
  const districtOptions = useMemo(
    () => toSelectOptions(districtsQuery.data, selectedProvinceId ? "Select district" : "Select province first", defaultValues.districtId),
    [defaultValues.districtId, districtsQuery.data, selectedProvinceId]
  );
  const wardOptions = useMemo(
    () => toSelectOptions(wardsQuery.data, selectedDistrictId ? "Select ward" : "Select district first", defaultValues.wardId),
    [defaultValues.wardId, selectedDistrictId, wardsQuery.data]
  );
  const amenityOptions = useMemo(
    () => toSelectOptions(amenitiesQuery.data, "No amenity", defaultValues.amenityId),
    [amenitiesQuery.data, defaultValues.amenityId]
  );
  const saveMutation = useMutation({
    mutationFn: (values: PropertyFormValues) =>
      isEditMode ? updateProperty(id ?? "", toRequest(values)) : createProperty(toRequest(values))
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      const saved = await saveMutation.mutateAsync(values);
      navigate(`/properties/${saved.id}`, { replace: true });
    } catch (error) {
      const normalizedError = normalizeUnknownError(error);

      Object.entries(normalizedError.fieldErrors).forEach(([field, message]) => {
        const localField = field.replace(/^address\./, "") as keyof PropertyFormValues;

        if (localField in defaultValues) {
          setError(localField, { message });
        }
      });

      setFormError(normalizedError.message);
    }
  });

  if (propertyQuery.isLoading) {
    return (
      <section className="content-section">
        <EmptyState title="Loading property" description="Preparing the edit form." />
      </section>
    );
  }

  if (propertyQuery.error) {
    const normalizedError = normalizeUnknownError(propertyQuery.error);
    return (
      <section className="content-section">
        <EmptyState
          title="Property could not be loaded"
          description={normalizedError.message}
          action={<Button onClick={() => propertyQuery.refetch()}>Retry</Button>}
        />
      </section>
    );
  }

  return (
    <section>
      <Button asChild variant="ghost" size="sm">
        <Link to={isEditMode ? `/properties/${id}` : "/properties"}>
          <ArrowLeft size={16} />
          Back
        </Link>
      </Button>
      <div className="section-header">
        <div>
          <p className="eyebrow">Properties</p>
          <h2>{isEditMode ? "Edit property" : "Create property"}</h2>
        </div>
      </div>
      <form className="property-form" onSubmit={onSubmit}>
        <FormSection title="Basic info">
          <Input label="Code" error={errors.code?.message} {...register("code")} />
          <Input label="Name" error={errors.name?.message} {...register("name")} />
          <Select label="Purpose" options={purposeOptions} error={errors.purpose?.message} {...register("purpose")} />
          <Select
            label="Property type"
            options={propertyTypeOptions}
            error={errors.propertyTypeId?.message}
            disabled={propertyTypesQuery.isLoading}
            {...register("propertyTypeId")}
          />
          <Input label="Available from" type="date" error={errors.availableFrom?.message} {...register("availableFrom")} />
          <Input label="Description" error={errors.description?.message} {...register("description")} />
        </FormSection>
        <FormSection title="Price and area">
          <Input label="Price" error={errors.price?.message} {...register("price")} />
          <Input label="Currency" error={errors.currency?.message} onInput={(event) => {
            event.currentTarget.value = event.currentTarget.value.toUpperCase();
          }} {...register("currency")} />
          <Input label="Land area" error={errors.landArea?.message} {...register("landArea")} />
          <Input label="Floor area" error={errors.floorArea?.message} {...register("floorArea")} />
        </FormSection>
        <FormSection title="Address">
          <Select
            label="Province"
            options={provinceOptions}
            error={errors.provinceId?.message}
            disabled={provincesQuery.isLoading}
            {...register("provinceId", {
              onChange: () => {
                setValue("districtId", "");
                setValue("wardId", "");
              }
            })}
          />
          <Select
            label="District"
            options={districtOptions}
            error={errors.districtId?.message}
            disabled={!selectedProvinceId || districtsQuery.isLoading}
            {...register("districtId", {
              onChange: () => setValue("wardId", "")
            })}
          />
          <Select
            label="Ward"
            options={wardOptions}
            error={errors.wardId?.message}
            disabled={!selectedDistrictId || wardsQuery.isLoading}
            {...register("wardId")}
          />
          <Input label="Street" error={errors.street?.message} {...register("street")} />
          <Input label="Address line" error={errors.addressLine?.message} {...register("addressLine")} />
          <Input label="Latitude" error={errors.latitude?.message} {...register("latitude")} />
          <Input label="Longitude" error={errors.longitude?.message} {...register("longitude")} />
        </FormSection>
        <FormSection title="Attributes">
          <Input label="Bedrooms" error={errors.bedrooms?.message} {...register("bedrooms")} />
          <Input label="Bathrooms" error={errors.bathrooms?.message} {...register("bathrooms")} />
          <Input label="Floors" error={errors.floors?.message} {...register("floors")} />
          <Select label="Direction" options={directionOptions} error={errors.direction?.message} {...register("direction")} />
        </FormSection>
        <FormSection title="Legal">
          <Select label="Legal status" options={legalStatusOptions} error={errors.legalStatus?.message} {...register("legalStatus")} />
          <Select label="Furniture status" options={furnitureOptions} error={errors.furnitureStatus?.message} {...register("furnitureStatus")} />
        </FormSection>
        <FormSection title="Amenities">
          <Select
            label="Amenity"
            options={amenityOptions}
            error={errors.amenityId?.message}
            disabled={amenitiesQuery.isLoading}
            {...register("amenityId")}
          />
          <Input label="Amenity note" error={errors.amenityNote?.message} {...register("amenityNote")} />
        </FormSection>
        <FormSection title="Assignment">
          <Input label="Owner id" error={errors.ownerId?.message} {...register("ownerId")} />
          <Input label="Assigned agent id" error={errors.assignedAgentId?.message} {...register("assignedAgentId")} />
        </FormSection>
        {formError ? <p className="form-alert">{formError}</p> : null}
        <div className="form-actions">
          <Button type="submit" disabled={isSubmitting || saveMutation.isPending}>
            <Save size={16} />
            {isEditMode ? "Save changes" : "Create property"}
          </Button>
        </div>
      </form>
    </section>
  );
}
