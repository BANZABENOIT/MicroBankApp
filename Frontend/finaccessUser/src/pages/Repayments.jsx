import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ClientLayout from "../components/ClientLayout";
import { fetchMyCredits } from "../redux/slices/creditSlice";
import "./Repayments.css";
import "./Repayments.css";

function Repayments() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.credits);

  useEffect(() => {
    dispatch(fetchMyCredits());
  }, [dispatch]);

  const activeCredits = items.filter((c) => ["approved", "repaying"].includes(c.status));

  return (
    <ClientLayout title="Mes remboursements" subtitle="Suivez vos échéances de remboursement">
      <div className="c-card">
        <table className="c-table">
          <thead>
            <tr>
              <th>Crédit</th>
              <th>Montant total</th>
              <th>Reste à payer</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {activeCredits.map((credit) => (
              <tr key={credit.id}>
                <td>{credit.reference}</td>
                <td>{credit.amount?.toLocaleString("fr-FR")} BIF</td>
                <td>{(credit.amount - (credit.amountPaid || 0)).toLocaleString("fr-FR")} BIF</td>
                <td><span className="c-badge status-repaying">En cours</span></td>
                <td>
                  <button className="c-link" onClick={() => navigate(`/credits/${credit.id}`)}>
                    Rembourser →
                  </button>
                </td>
              </tr>
            ))}
            {!loading && activeCredits.length === 0 && (
              <tr>
                <td colSpan={5}>Aucun remboursement en cours.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ClientLayout>
  );
}

export default Repayments;
