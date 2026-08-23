import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { fetchCreditDetail, makeRepayment } from "../redux/slices/creditSlice";
import "./CreditDetail.css";

function CreditDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected: credit, loading } = useSelector((state) => state.credits);

  useEffect(() => {
    dispatch(fetchCreditDetail(id));
  }, [dispatch, id]);

  const handleRepay = async () => {
    const result = await dispatch(makeRepayment({ creditId: id }));
    if (makeRepayment.fulfilled.match(result)) {
      toast.success("Remboursement effectué !");
      dispatch(fetchCreditDetail(id));
    } else {
      toast.error(result.payload);
    }
  };

  const paid = credit?.amountPaid || 0;
  const percent = credit ? Math.round((paid / credit.amount) * 100) : 0;

  return (
    <div className="c-layout">
      <Sidebar />
      <div className="c-content">
        <Topbar title="Détails du crédit" subtitle="" />
        <main className="c-main">
          <button className="c-link back-link" onClick={() => navigate("/credits")}>
            <FiArrowLeft /> Retour
          </button>

          {loading && <p>Chargement...</p>}

          {credit && (
            <>
              <div className="c-card">
                <div className="detail-header">
                  <h2>{credit.reference}</h2>
                  <span className={`c-badge status-${credit.status}`}>{credit.status}</span>
                </div>

                <div className="detail-info-grid">
                  <div>
                    <span className="request-label">Montant accordé</span>
                    <p>{credit.amount?.toLocaleString("fr-FR")} BIF</p>
                  </div>
                  <div>
                    <span className="request-label">Durée</span>
                    <p>{credit.durationMonths} mois</p>
                  </div>
                  <div>
                    <span className="request-label">Date d'accord</span>
                    <p>{credit.createdAt}</p>
                  </div>
                  <div>
                    <span className="request-label">Taux d'intérêt</span>
                    <p>{credit.interestRate}%</p>
                  </div>
                  <div>
                    <span className="request-label">Date d'échéance</span>
                    <p>{credit.dueDate}</p>
                  </div>
                  <div>
                    <span className="request-label">Reste à payer</span>
                    <p>{(credit.amount - paid).toLocaleString("fr-FR")} BIF</p>
                  </div>
                </div>

                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${percent}%` }} />
                </div>
                <p className="progress-label">
                  Déjà remboursé : {paid.toLocaleString("fr-FR")} BIF ({percent}%)
                </p>
              </div>

              <div className="c-card">
                <h3>Échéancier de remboursement</h3>
                <table className="c-table">
                  <thead>
                    <tr>
                      <th>Date d'échéance</th>
                      <th>Montant prévu</th>
                      <th>Montant payé</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credit.schedule?.map((item) => (
                      <tr key={item.id}>
                        <td>{item.dueDate}</td>
                        <td>{item.amountDue?.toLocaleString("fr-FR")} BIF</td>
                        <td>{item.amountPaid?.toLocaleString("fr-FR")} BIF</td>
                        <td>
                          <span className={`c-badge status-${item.status}`}>
                            {item.status === "paid" ? "Payé" : "À payer"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {["approved", "repaying"].includes(credit.status) && (
                  <button className="c-btn c-btn-primary" style={{ marginTop: "1.2rem" }} onClick={handleRepay}>
                    Effectuer un remboursement
                  </button>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default CreditDetail;
