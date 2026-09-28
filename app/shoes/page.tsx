"use client";
import { useState } from "react";
import { Footprints } from "lucide-react";
import { PageHeader, Panel } from "@/components/fitness/ui";
import { DetailSlider } from "@/components/shared/detail-slider";
import { mockShoes } from "@/lib/mock-data";
export default function ShoesPage() {
  const [selected, setSelected] = useState(false);
  const shoe = mockShoes[0];
  return (
    <div className="fitness-page">
      <PageHeader
        title="Along for every kilometre"
        description="Keep your footwear reference close to your training history."
        eyebrow="EXPLORE / GEAR"
      />
      <Panel
        title="Saved footwear reference"
        subtitle="Legacy profile information · mileage is not linked to your current journal"
      >
        <button onClick={() => setSelected(true)} className="workout-row">
          <span className="activity-icon">
            <Footprints size={23} />
          </span>
          <span className="workout-name">
            <strong>
              {shoe.brand} {shoe.model}
            </strong>
            <small>{shoe.color} · View saved details</small>
          </span>
        </button>
      </Panel>
      <p className="data-note">
        The existing shoe record is preserved. Its stored mileage is unverified
        and is not presented as a measured total from your workouts.
      </p>
      {selected && (
        <DetailSlider
          open
          onOpenChange={setSelected}
          title={`${shoe.brand} ${shoe.model}`}
          subtitle="Existing footwear reference"
          fields={[
            { label: "Purchased", value: shoe.purchaseDate },
            {
              label: "Stored mileage (unverified)",
              value: `${shoe.currentDistance} km`,
            },
            {
              label: "Stored replacement target",
              value: `${shoe.retireAt} km`,
            },
            { label: "Notes", value: shoe.notes },
          ]}
        />
      )}
    </div>
  );
}
