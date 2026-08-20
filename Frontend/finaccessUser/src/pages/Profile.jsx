import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiCamera } from "react-icons/fi";
import ClientLayout from "../components/ClientLayout";
import { fetchProfile, updateProfile } from "../redux/slices/profileSlice";
import "./Profile.css";

function Profile() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.profile);
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (data) setAddress(data.address || "");
  }, [data]);

  const handlePhotoClick = () => {
    toast.info("La modification de la photo sera bientôt disponible.");
  };

  const handleSave = async () => {
    const result = await dispatch(updateProfile({ address }));
    if (updateProfile.fulfilled.match(result)) {
      toast.success("Profil mis à jour !");
      setIsEditing(false);
    } else {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  return (
    <ClientLayout title="Mon profil" subtitle="Vos informations personnelles">
      <div className="c-card profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">{data?.name?.slice(0, 2) || "U"}</div>
            <button className="profile-avatar-edit" onClick={handlePhotoClick}>
              <FiCamera />
            </button>
          </div>
        </div>

        <div className="profile-fields">
          {loading && <p>Chargement...</p>}

          {data && (
            <>
              <div className="profile-field">
                <span className="profile-label">Nom complet</span>
                <p>{data.name}</p>
              </div>
              <div className="profile-field">
                <span className="profile-label">Email</span>
                <p>{data.email}</p>
              </div>
              <div className="profile-field">
                <span className="profile-label">Téléphone</span>
                <p>{data.phone || "—"}</p>
              </div>
              <div className="profile-field">
                <span className="profile-label">Numéro client</span>
                <p>{data.reference}</p>
              </div>
              <div className="profile-field">
                <span className="profile-label">Adresse</span>
                {isEditing ? (
                  <input
                    className="profile-edit-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                ) : (
                  <p>{data.address || "—"}</p>
                )}
              </div>
              <div className="profile-field">
                <span className="profile-label">Date d'inscription</span>
                <p>{data.createdAt}</p>
              </div>
            </>
          )}

          {isEditing ? (
            <div className="profile-edit-actions">
              <button className="c-btn c-btn-outline" onClick={() => setIsEditing(false)}>
                Annuler
              </button>
              <button className="c-btn c-btn-primary" onClick={handleSave}>
                Enregistrer
              </button>
            </div>
          ) : (
            <button className="c-btn c-btn-primary" style={{ marginTop: "1rem" }} onClick={() => setIsEditing(true)}>
              Modifier mes informations
            </button>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}

export default Profile;
