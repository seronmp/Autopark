"use client";

import React, { useState, useEffect } from "react";
import { translations } from "@/dictionaries";
import { 
  Car, 
  Truck, 
  User, 
  Calendar as CalendarIcon, 
  Clock, 
  Gauge, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Plus, 
  Pencil, 
  Trash2, 
  Settings2, 
  X 
} from "lucide-react";

export type Vehicle = {
  id: string | number;
  name: string;
  plate: string;
  type: "truck" | "van" | "car";
  km: number;
  status: "available" | "busy" | "maintenance";
};

const DEFAULT_VEHICLES: Vehicle[] = [
  { id: 1, name: "Furgone SERON-Express", plate: "BZ 482 EK", type: "truck", km: 3333, status: "available" },
  { id: 2, name: "VW Caddy Maxi", plate: "BZ 910 DL", type: "van", km: 84210, status: "available" },
  { id: 3, name: "Fiat Doblò Cargo", plate: "BZ 325 XM", type: "van", km: 41200, status: "busy" },
  { id: 4, name: "Toyota Yaris Hybrid", plate: "BZ 671 TR", type: "car", km: 19850, status: "available" },
  { id: 5, name: "Mercedes Sprinter 315", plate: "BZ 804 AP", type: "truck", km: 112400, status: "maintenance" },
];

  export default function ReservationBookingPanel({ lang = "it" }: { lang?: "it" | "de" }) {
    const t = translations[lang];
  const [vehicles, setVehicles] = useState<Vehicle[]>(DEFAULT_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | number>(DEFAULT_VEHICLES[0].id);

  // Form prenotazione
  const [driverName, setDriverName] = useState("");
  const [driverDepartment, setDriverDepartment] = useState("Logistica");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("08:30");
  const [endTime, setEndTime] = useState("12:30");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [calendarSyncWarning, setCalendarSyncWarning] = useState(false);

  // Stato Modale Gestione Flotta
  const [isFleetModalOpen, setIsFleetModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form Veicolo Edit/New
  const [vehName, setVehName] = useState("");
  const [vehPlate, setVehPlate] = useState("");
  const [vehType, setVehType] = useState<"truck" | "van" | "car">("truck");
  const [vehKm, setVehKm] = useState(0);
  const [vehStatus, setVehStatus] = useState<"available" | "busy" | "maintenance">("available");

  // Carica veicoli dal backend se disponibile
  useEffect(() => {
    fetch("/api/vehicles")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setVehicles(data);
          setSelectedVehicleId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const activeVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const handleStartEdit = (veh: Vehicle) => {
    setEditingVehicle(veh);
    setIsCreatingNew(false);
    setVehName(veh.name);
    setVehPlate(veh.plate);
    setVehType(veh.type);
    setVehKm(veh.km);
    setVehStatus(veh.status);
  };

  const handleStartCreate = () => {
    setIsCreatingNew(true);
    setEditingVehicle(null);
    setVehName("");
    setVehPlate("");
    setVehType("truck");
    setVehKm(0);
    setVehStatus("available");
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehName) return;

    if (isCreatingNew) {
      const newV: Vehicle = {
        id: Date.now(),
        name: vehName,
        plate: vehPlate,
        type: vehType,
        km: Number(vehKm),
        status: vehStatus,
      };
      setVehicles([...vehicles, newV]);
      // Sincronizza DB
      fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newV),
      }).catch(() => {});
    } else if (editingVehicle) {
      const updatedList = vehicles.map((v) =>
        v.id === editingVehicle.id
          ? { ...v, name: vehName, plate: vehPlate, type: vehType, km: Number(vehKm), status: vehStatus }
          : v
      );
      setVehicles(updatedList);
      // Sincronizza DB
      fetch("/api/vehicles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingVehicle.id, name: vehName, plate: vehPlate, type: vehType, km: vehKm, status: vehStatus }),
      }).catch(() => {});
    }

    setEditingVehicle(null);
    setIsCreatingNew(false);
  };

  const handleDeleteVehicle = (id: string | number) => {
    if (confirm(t.deleteVehicleConfirm)) {
      const filtered = vehicles.filter((v) => v.id !== id);
      setVehicles(filtered);
      if (selectedVehicleId === id && filtered.length > 0) {
        setSelectedVehicleId(filtered[0].id);
      }
      fetch(`/api/vehicles?id=${id}`, { method: "DELETE" }).catch(() => {});
    }
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicle) return;
    setIsSubmitting(true);
    setBookingError("");
    setSuccessToast(false);
    setCalendarSyncWarning(false);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: activeVehicle.id,
          vehicle: activeVehicle.name,
          userName: driverName,
          department: driverDepartment,
          purpose: destination,
          startDateTime: `${startDate}T${startTime}:00`,
          endDateTime: `${startDate}T${endTime}:00`,
          startKm: activeVehicle.km,
          notes,
          title: `${activeVehicle.name} - ${driverName}`,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t.bookingFailed);
      setCalendarSyncWarning(result.calendarSynced === false);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 5000);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : t.bookingFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Header con pulsante Gestione Flotta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              {t.fleetManagement}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            {t.title}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFleetModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Settings2 className="h-4 w-4 text-slate-500" />
            {t.manageVehicles} ({vehicles.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLONNA SINISTRA: SELEZIONE MEZZO */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800">
              {t.selectVehicleLabel}
            </label>
            <button
              onClick={() => {
                setIsFleetModalOpen(true);
                handleStartCreate();
              }}
              className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> {t.addVehicle}
            </button>
          </div>

          <div className="space-y-3">
            {vehicles.map((vehicle) => {
              const isSelected = selectedVehicleId === vehicle.id;
              const isMaint = vehicle.status === "maintenance";

              return (
                <div
                  key={vehicle.id}
                  onClick={() => !isMaint && setSelectedVehicleId(vehicle.id)}
                  className={`group relative flex items-center p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/40 shadow-sm ring-1 ring-blue-600"
                      : isMaint
                      ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
                  }`}
                >
                  <div className={`p-2.5 rounded-lg mr-3.5 ${
                    isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {vehicle.type === "truck" ? <Truck className="h-5 w-5" /> : <Car className="h-5 w-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-900 text-sm truncate">
                        {vehicle.name}
                      </div>
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        {vehicle.plate || t.noPlate}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Gauge className="h-3.5 w-3.5 text-slate-400" />
                        {vehicle.km.toLocaleString()} km
                      </span>
                      <span>•</span>
                      <span className={`font-medium ${
                        vehicle.status === "available"
                          ? "text-emerald-600"
                          : vehicle.status === "busy"
                          ? "text-amber-600"
                          : "text-rose-600"
                      }`}>
                        {vehicle.status === "available" ? t.statusAvailable : vehicle.status === "busy" ? t.statusBusy : t.statusMaintenance}
                      </span>
                    </div>
                  </div>

                  {/* Pulsante rapido modifica su ogni riga */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFleetModalOpen(true);
                      handleStartEdit(vehicle);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition ml-2"
                    title={t.editTitle}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {activeVehicle && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span className="text-slate-500">{t.initialMileage}:</span>
              <span className="font-semibold text-slate-800 text-sm">{activeVehicle.km} km</span>
            </div>
          )}
        </div>

        {/* COLONNA DESTRA: FORM PRENOTAZIONE */}
        <div className="lg:col-span-7 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">
              {t.details}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.detailsSub}
            </p>
          </div>

          <form onSubmit={handleReservationSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" /> {t.driver}
                </label>
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder={t.driverPlaceholder}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3.5 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.department}
                </label>
                <select
                  value={driverDepartment}
                  onChange={(e) => setDriverDepartment(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3.5 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="Logistica">{t.departmentLogistics}</option>
                  <option value="Vendite">{t.departmentSales}</option>
                  <option value="Direzione">{t.departmentManagement}</option>
                  <option value="Tecnico">{t.departmentTechnical}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> {t.destination}
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={t.destinationPlaceholder}
                className="w-full text-sm rounded-lg border border-slate-300 px-3.5 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5 text-slate-400" /> {t.date}
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> {t.startTime}
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> {t.endTime}
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-400" /> {t.notes}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
                className="w-full text-sm rounded-lg border border-slate-300 px-3.5 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-800">
              <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span>{t.outlookNotice}</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-medium text-sm shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? t.submitting : t.submit}
              </button>
            </div>

            {successToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {calendarSyncWarning ? `${t.bookingSaved} ${t.outlookSyncWarning}` : t.bookingSaved}
              </div>
            )}
            {bookingError && (
              <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                {bookingError}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* MODALE DI GESTIONE FLOTTA (AGGIUNGI, MODIFICA, ELIMINA MEZZI) */}
      {isFleetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
            {/* Header modale */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t.manageFleetTitle}</h3>
                <p className="text-xs text-slate-500">{t.manageFleetDescription}</p>
              </div>
              <button
                onClick={() => {
                  setIsFleetModalOpen(false);
                  setEditingVehicle(null);
                  setIsCreatingNew(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenuto modale */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              {/* Form Nuovo / Modifica */}
              {(isCreatingNew || editingVehicle) ? (
                <form onSubmit={handleSaveVehicle} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {isCreatingNew ? t.newVehicle : `${t.editVehicle}: ${editingVehicle?.name}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setEditingVehicle(null); setIsCreatingNew(false); }}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      {t.cancelEdit}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{t.vehicleName}</label>
                      <input
                        type="text"
                        required
                        value={vehName}
                        onChange={(e) => setVehName(e.target.value)}
                        placeholder="Mercedes Sprinter 315"
                        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{t.plate}</label>
                      <input
                        type="text"
                        value={vehPlate}
                        onChange={(e) => setVehPlate(e.target.value)}
                        placeholder="BZ 123 XY"
                        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{t.type}</label>
                      <select
                        value={vehType}
                        onChange={(e) => setVehType(e.target.value as any)}
                        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white"
                      >
                        <option value="truck">{t.vehicleTypeTruck}</option>
                        <option value="van">{t.vehicleTypeVan}</option>
                        <option value="car">{t.vehicleTypeCar}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{t.currentMileage}</label>
                      <input
                        type="number"
                        value={vehKm}
                        onChange={(e) => setVehKm(Number(e.target.value))}
                        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{t.vehicleStatus}</label>
                      <select
                        value={vehStatus}
                        onChange={(e) => setVehStatus(e.target.value as any)}
                        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white"
                      >
                        <option value="available">{t.statusAvailable}</option>
                        <option value="busy">{t.statusBusy}</option>
                        <option value="maintenance">{t.statusMaintenance}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                    >
                      {isCreatingNew ? t.addToFleet : t.saveChanges}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={handleStartCreate}
                  className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-xs font-semibold text-blue-600 hover:border-blue-400 hover:bg-blue-50/40 flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="h-4 w-4" /> {t.addNewVehicle}
                </button>
              )}

              {/* Tabella / Lista Mezzi esistenti */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {t.activeVehicles} ({vehicles.length})
                </div>
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                        {v.type === "truck" ? <Truck className="h-4 w-4" /> : <Car className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{v.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded">{v.plate || t.noPlate}</span>
                          <span>•</span>
                          <span>{v.km.toLocaleString()} km</span>
                          <span>•</span>
                          <span className={v.status === "available" ? "text-emerald-600" : v.status === "busy" ? "text-amber-600" : "text-rose-600"}>
                            {v.status === "available" ? t.statusAvailable : v.status === "busy" ? t.statusBusy : t.statusMaintenance}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(v)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title={t.editTitle}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(v.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title={t.deleteTitle}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer modale */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => {
                  setIsFleetModalOpen(false);
                  setEditingVehicle(null);
                  setIsCreatingNew(false);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
