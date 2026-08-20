import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiSearch, FiFilter, FiEye, FiCheck, FiX } from "react-icons/fi";
import AdminLayout from "../components/AdminLayout";
import Modal from "../components/Modal";
import {
  fetchCreditRequests,
  approveCreditRequest,
  rejectCreditRequest,
  selectRequest,
  clearSelection,
} from "../redux/slices/creditRequestSlice";
import "./CreditRequests.css";

const TABS = [
  { key: "all", label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "approved", label: "Approuvées" },
  { key: "rejected", label: "Refusées" },
];

function CreditRequests() {
  const dispatch = useDispatch();
  const { items, selected, loading } = useSelector((state) => state.creditRequests);
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchCreditRequests());
  }, [dispatch]);

  const counts = {
    all: items.length,
    pending: items.filter((r) => r.status === "pending").length,
    approved: items.filter((r) => r.status === "approved").length,
    rejected: items.filter((r) => r.status === "rejected").length,
  };

  const filtered = items.filter((r) => {
    const matchesTab = activeTab === "all" || r.status === activeTab;
    const matchesSearch = `${r.clientName} ${r.reference}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleApprove = async (id) => {
    const result = await dispatch(approveCreditRequest(id));
    if (approveCreditRequest.fulfilled.match(result)) {
      toast.success("Demande approuvée.");
    } else {
      toast.error(result.payload);
    }
  };

  const handleReject = async (id) => {
    const result = await dispatch(rejectCreditRequest(id));
    if (rejectCreditRequest.fulfilled.match(result)) {
      toast.success("Demande refusée.");
    } else {
      toast.error(result.payload);
    }
  };

  return (
    <AdminLayout title="Demandes de crédit" subtitle="Gérez les demandes de crédit">
      <div className="tabs-row">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={"tab-btn" + (activeTab === tab.key ? " active" : "")}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      <div className="table-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="admin-btn admin-btn-outline">
          <FiFilter /> Filtrer
        </button>
      </div>

      <div className="request-list">
        {filtered.map((req) => (
          <div className="request-row admin-card" key={req.id}>
            <div>
              <strong>{req.reference}</strong>
              <p className="request-client">{req.clientName}</p>
            </div>
            <div>
              <span className="request-label">Montant demandé</span>
              <p>{req.amount?.toLocaleString("fr-FR")} BIF</p>
            </div>
            <div>
              <span className="request-label">Durée</span>
              <p>{req.durationMonths} mois</p>
            </div>
            <div>
              <span className="request-label">Date demande</span>
              <p>{req.createdAt}</p>
            </div>
            <div className={`request-status status-${req.status}`}>
              {req.status === "pending" && "En attente"}
              {req.status === "approved" && "Approuvée"}
              {req.status === "rejected" && "Refusée"}
            </div>
            <div className="request-actions">
              <button className="icon-btn" onClick={() => dispatch(selectRequest(req.id))}>
                <FiEye />
              </button>
              {req.status === "pending" && (
                <>
                  <button className="icon-btn icon-approve" onClick={() => handleApprove(req.id)}>
                    <FiCheck />
                  </button>
                  <button className="icon-btn icon-reject" onClick={() => handleReject(req.id)}>
                    <FiX />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <p className="table-empty">Aucune demande dans cette catégorie.</p>
        )}
      </div>

      {selected && (
        <Modal title={`Détails de la demande : ${selected.reference}`} onClose={() => dispatch(clearSelection())}>
          <div className="request-detail-grid">
            <div>
              <h4>Informations client</h4>
              <p><strong>{selected.clientName}</strong></p>
              <p>{selected.clientReference}</p>
              <p>{selected.clientPhone}</p>
              <p>{selected.clientEmail}</p>
            </div>
            <div>
              <h4>Informations demande</h4>
              <p>Montant : {selected.amount?.toLocaleString("fr-FR")} BIF</p>
              <p>Durée : {selected.durationMonths} mois</p>
              <p>Motif : {selected.reason}</p>
              <p>Date de demande : {selected.createdAt}</p>
              <p>Statut : {selected.status}</p>
            </div>
          </div>

          {selected.status === "pending" && (
            <div className="request-detail-buttons">
              <button
                className="admin-btn admin-btn-danger"
                onClick={() => handleReject(selected.id)}
              >
                Refuser la demande
              </button>
              <button
                className="admin-btn admin-btn-success"
                onClick={() => handleApprove(selected.id)}
              >
                Approuver la demande
              </button>
            </div>
          )}
        </Modal>
      )}
    </AdminLayout>
  );
}

export default CreditRequests;
