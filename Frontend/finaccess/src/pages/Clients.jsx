import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiSearch, FiFilter, FiPlus, FiEye, FiEdit2 } from "react-icons/fi";
import { toast } from "react-toastify";
import AdminLayout from "../components/AdminLayout";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import {
  createClient,
  fetchClients,
  updateClientStatus,
} from "../redux/slices/clientSlice";
import "./Table.css";

const PAGE_SIZE = 8;

function Clients() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.clients);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    date_naissance: "",
    sexe: "",
  });

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  const filtered = items.filter((c) =>
    `${c.name} ${c.email}`.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCreate = async (event) => {
    event.preventDefault();
    const result = await dispatch(createClient(form));
    if (createClient.fulfilled.match(result)) {
      toast.success("Client créé avec succès.");
      setShowCreate(false);
      setForm({
        nom: "",
        prenom: "",
        email: "",
        phone: "",
        password: "",
        address: "",
        date_naissance: "",
        sexe: "",
      });
    } else {
      toast.error(result.payload);
    }
  };

  const toggleStatus = async (client) => {
    const status = client.status === "actif" ? "inactif" : "actif";
    const result = await dispatch(
      updateClientStatus({ id: client.id, status }),
    );
    if (updateClientStatus.fulfilled.match(result)) {
      toast.success("Statut client mis à jour.");
    } else {
      toast.error(result.payload);
    }
  };

  return (
    <AdminLayout title="Clients" subtitle="Gérez tous les clients de FinAccess">
      <div className="table-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="table-toolbar-actions">
          <button className="admin-btn admin-btn-outline">
            <FiFilter /> Filtrer
          </button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setShowCreate(true)}
          >
            <FiPlus /> Ajouter un client
          </button>
        </div>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>N° Client</th>
              <th>Nom complet</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((client) => (
              <tr key={client.id}>
                <td>{client.reference}</td>
                <td>{client.name}</td>
                <td>{client.phone}</td>
                <td>{client.email}</td>
                <td>
                  <StatusBadge status={client.status} />
                </td>
                <td>
                  <button
                    className="icon-btn"
                    title="Voir le client"
                    onClick={() => setSelectedClient(client)}
                  >
                    <FiEye />
                  </button>
                  <button
                    className="icon-btn"
                    title="Activer ou désactiver"
                    onClick={() => toggleStatus(client)}
                  >
                    <FiEdit2 />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && pageItems.length === 0 && (
              <tr>
                <td colSpan={6} className="table-empty">
                  Aucun client trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="table-pagination">
          <button
            className="admin-btn admin-btn-outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Précédent
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            className="admin-btn admin-btn-outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </button>
        </div>
      </div>

      {showCreate && (
        <Modal title="Ajouter un client" onClose={() => setShowCreate(false)}>
          <form className="client-create-form" onSubmit={handleCreate}>
            <div className="client-form-grid">
              <label>
                Prénom
                <input
                  required
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                />
              </label>
              <label>
                Nom
                <input
                  required
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
              <label>
                Téléphone
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </label>
              <label>
                Mot de passe
                <input
                  required
                  minLength={8}
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </label>
              <label>
                Date de naissance
                <input
                  required
                  type="date"
                  value={form.date_naissance}
                  onChange={(e) =>
                    setForm({ ...form, date_naissance: e.target.value })
                  }
                />
              </label>
              <label>
                Sexe
                <select
                  required
                  value={form.sexe}
                  onChange={(e) => setForm({ ...form, sexe: e.target.value })}
                >
                  <option value="">Choisir</option>
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                </select>
              </label>
              <label>
                Adresse
                <input
                  required
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </label>
            </div>
            <button className="admin-btn admin-btn-primary" type="submit">
              Créer le client
            </button>
          </form>
        </Modal>
      )}

      {selectedClient && (
        <Modal
          title="Détails du client"
          onClose={() => setSelectedClient(null)}
        >
          <div className="client-detail">
            <p>
              <strong>Référence :</strong> {selectedClient.reference}
            </p>
            <p>
              <strong>Nom :</strong> {selectedClient.name}
            </p>
            <p>
              <strong>Email :</strong> {selectedClient.email}
            </p>
            <p>
              <strong>Téléphone :</strong> {selectedClient.phone}
            </p>
            <p>
              <strong>Statut :</strong> {selectedClient.status}
            </p>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

export default Clients;
