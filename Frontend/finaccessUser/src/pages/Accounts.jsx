import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiCreditCard } from "react-icons/fi";
import ClientLayout from "../components/ClientLayout";
import { fetchMyAccounts } from "../redux/slices/accountSlice";
import "./Accounts.css";

function Accounts() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.accounts);

  useEffect(() => {
    dispatch(fetchMyAccounts());
  }, [dispatch]);

  return (
    <ClientLayout title="Mes comptes" subtitle="Vos comptes bancaires">
      <div className="accounts-list">
        {items.map((account) => (
          <div className="c-card account-card" key={account.id}>
            <div className="account-card-header">
              <div className="account-icon">
                <FiCreditCard />
              </div>
              <div>
                <strong>{account.type}</strong>
                <span className={`c-badge status-${account.status}`}>{account.status}</span>
              </div>
            </div>
            <p className="request-label">Numéro de compte</p>
            <p className="account-number">{account.reference}</p>
            <p className="request-label">Solde disponible</p>
            <p className="account-balance">{account.balance?.toLocaleString("fr-FR")} BIF</p>
          </div>
        ))}
        {!loading && items.length === 0 && <p>Aucun compte trouvé.</p>}
      </div>

      {items.length > 0 && (
        <button className="c-btn c-btn-primary accounts-all-btn" onClick={() => dispatch(fetchMyAccounts())}>
          Voir tous mes comptes
        </button>
      )}
    </ClientLayout>
  );
}

export default Accounts;
