import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "../redux/slices/authSlice";
import "./Auth.css";

function Register() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    date_naissance: "",
    sexe: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(result)) {
      toast.success("Compte créé avec succès ! Connecte-toi maintenant.");
      navigate("/login");
    } else {
      toast.error(result.payload || "Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form auth-form-wide" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <span className="auth-logo">FA</span>
          FinAccess
        </div>
        <h2>Créer un compte</h2>

        <div className="auth-row">
          <div>
            <label>Prénom</label>
            <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required />
          </div>
          <div>
            <label>Nom</label>
            <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />
          </div>
        </div>

        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label>Téléphone</label>
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />

        <label>Mot de passe</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} minLength={8} required />

        <label>Adresse</label>
        <input type="text" name="address" value={formData.address} onChange={handleChange} required />

        <div className="auth-row">
          <div>
            <label>Date de naissance</label>
            <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} required />
          </div>
          <div>
            <label>Sexe</label>
            <select name="sexe" value={formData.sexe} onChange={handleChange} required>
              <option value="">Choisir...</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Création..." : "S'inscrire"}
        </button>

        <p>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
