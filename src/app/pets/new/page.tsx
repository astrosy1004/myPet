import { PetForm } from "@/components/PetForm";

export default function NewPetPage() {
  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
      <h1 className="mb-6 text-xl font-bold text-zinc-900">반려동물 등록</h1>
      <PetForm />
    </div>
  );
}
