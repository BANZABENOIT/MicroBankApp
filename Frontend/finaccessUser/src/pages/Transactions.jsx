import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiFilter, FiArrowDownCircle, FiArrowUpCircle } from "react-icons/fi";
import ClientLayout from "../components/ClientLayout";
import { fetchMyTransactions } from "../redux/slices/transactionSlice";
import "./Transactions.css";

const TYPE_LABELS = {
  deposit: "Dépôt épargne",
  withdrawal: "Retrait compte",
  loan_disbursement: "Prêt accordé",
  repayment_out: "Remboursement crédit",
  repayment_in: "Remboursement reçu",
  epargne: "Dépôt épargne",
  credit: "Prêt accordé",
  remboursement: "Remboursement crédit",
};

const VISIBLE_STEP = 8;

function Transactions() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.transactions);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [visibleCount, setVisibleCount] = useState(VISIBLE_STEP);

  useEffect(() => {
    dispatch(fetchMyTransactions());
  }, [dispatch]);

  const filtered = items.filter((tx) => {
    if (fromDate && tx.date < fromDate) return false;
    if (toDate && tx.date > toDate) return false;
    return true;
  });

  const visible = filtered.slice(0, visibleCount);

  return (
    <ClientLayout title="Mes transactions" subtitle="Toutes vos opérations financières">
      <div className="tx-toolbar">
        <select className="tx-select" defaultValue="all">
          <option value="all">Tous comptes</option>
        </select>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <button className="c-btn c-btn-outline">
          <FiFilter /> Filtrer
        </button>
      </div>

      <div className="c-card">
        <ul className="tx-full-list">
          {visible.map((tx) => {
            const positive = tx.amount >= 0;
            return (
              <li key={tx.id}>
                <div className="tx-row-left">
                  <span className={`tx-icon ${positive ? "tx-icon-positive" : "tx-icon-negative"}`}>
                    {positive ? <FiArrowDownCircle /> : <FiArrowUpCircle />}
                  </span>
                  <div>
                    <span className="tx-label">{TYPE_LABELS[tx.type] || tx.type}</span>
                    <span className="tx-date-inline">{tx.date}</span>
                  </div>
                </div>
                <span className={positive ? "tx-amount-positive" : "tx-amount-negative"}>
                  {positive ? "+" : ""}
                  {tx.amount?.toLocaleString("fr-FR")} BIF
                </span>
              </li>
            );
          })}
          {!loading && visible.length === 0 && (
            <p className="dashboard-empty">Aucune transaction trouvée.</p>
          )}
        </ul>

        {visibleCount < filtered.length && (
          <button className="c-link tx-more-btn" onClick={() => setVisibleCount((c) => c + VISIBLE_STEP)}>
            Voir plus
          </button>
        )}
      </div>
    </ClientLayout>
  );
}

export default Transactions;
