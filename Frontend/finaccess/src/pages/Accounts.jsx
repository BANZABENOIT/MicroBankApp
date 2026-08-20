import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiSearch, FiFilter, FiPlus, FiEye, FiEdit2 } from "react-icons/fi";
import AdminLayout from "../components/AdminLayout";
import StatusBadge from "../components/StatusBadge";
import { fetchAccounts } from "../redux/slices/accountSlice";
import "./Table.css";

const PAGE_SIZE = 8;

function Accounts() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.accounts);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const filtered = items.filter((a) =>
    `${a.clientName} ${a.reference}`.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AdminLayout title="Comptes" subtitle="Gérez les comptes clients">
      <div className="table-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input
            placeholder="Rechercher un compte..."
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
          <button className="admin-btn admin-btn-primary">
            <FiPlus /> Ouvrir un compte
          </button>
        </div>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>N° Compte</th>
              <th>Client</th>
              <th>Type</th>
              <th>Solde</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((account) => (
              <tr key={account.id}>
                <td>{account.reference}</td>
                <td>{account.clientName}</td>
                <td>{account.type}</td>
                <td>{account.balance?.toLocaleString("fr-FR")} BIF</td>
                <td><StatusBadge status={account.status} /></td>
                <td>
                  <button className="icon-btn"><FiEye /></button>
                  <button className="icon-btn"><FiEdit2 /></button>
                </td>
              </tr>
            ))}
            {!loading && pageItems.length === 0 && (
              <tr>
                <td colSpan={6} className="table-empty">Aucun compte trouvé.</td>
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
          <span>Page {page} / {totalPages}</span>
          <button
            className="admin-btn admin-btn-outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Accounts;
