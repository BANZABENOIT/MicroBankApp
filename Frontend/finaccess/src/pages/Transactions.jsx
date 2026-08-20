import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiSearch } from "react-icons/fi";
import AdminLayout from "../components/AdminLayout";
import { fetchTransactions } from "../redux/slices/transactionSlice";
import "./Table.css";

const TYPE_LABELS = {
  deposit: "Dépôt",
  withdrawal: "Retrait",
  loan_disbursement: "Prêt accordé",
  repayment_out: "Remboursement envoyé",
  repayment_in: "Remboursement reçu",
};

function Transactions() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.transactions);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const filtered = items.filter((tx) =>
    `${tx.clientName || ""} ${tx.type}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Transactions" subtitle="Historique de tous les mouvements financiers">
      <div className="table-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Type</th>
              <th>Montant</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.clientName || "—"}</td>
                <td>{TYPE_LABELS[tx.type] || tx.type}</td>
                <td>{tx.amount?.toLocaleString("fr-FR")} BIF</td>
                <td>{new Date(tx.created_at || tx.createdAt).toLocaleString("fr-FR")}</td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="table-empty">Aucune transaction trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default Transactions;
