import React, { useEffect, useState } from "react";
import {
    ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView,
    ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { envoyerFiche, getFiche, getParcours, getPlanning } from "./src/api";

const BLEU = "#1f3a8a";
const STATUTS_THEME = {
    EN_ATTENTE: { label: "En attente de validation", fond: "#e0f2fe", texte: "#075985" },
    VALIDE: { label: "Thème validé", fond: "#dcfce7", texte: "#14532d" },
    MODIFICATIONS: { label: "Modifications demandées", fond: "#fef3c7", texte: "#78350f" },
    REJETE: { label: "Thème rejeté", fond: "#fee2e2", texte: "#7f1d1d" },
};

function StatutTheme({ statut, commentaire }) {
    const c = STATUTS_THEME[statut];
    if (!c) return null;
    return (
        <View style={[s.msg, { backgroundColor: c.fond }]}>
            <Text style={{ color: c.texte, fontWeight: "700" }}>{c.label}</Text>
            {commentaire ? <Text style={{ color: c.texte, marginTop: 4 }}>Commentaire de l'évaluateur : {commentaire}</Text> : null}
        </View>
    );
}

const VIDE = { matricule: "", nom: "", prenom: "", telephone: "", date_naissance: "", lieu_naissance: "", parcours: "INFO", theme: "", description: "", technologies: "", lieu_stage: "" };

// Saisie guidée de la date : "17052001" -> "17/05/2001"
const formaterDateSaisie = (v) => {
    const c = String(v).replace(/\D/g, "").slice(0, 8);
    if (c.length <= 2) return c;
    if (c.length <= 4) return `${c.slice(0, 2)}/${c.slice(2)}`;
    return `${c.slice(0, 2)}/${c.slice(2, 4)}/${c.slice(4)}`;
};
// "2001-05-17" (serveur) -> "17/05/2001" (affichage)
const dateVersSaisie = (iso) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
    return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
};

function Champ({ label, multiline, ...props }) {
    return (
        <View style={s.champ}>
            <Text style={s.label}>{label}</Text>
            <TextInput
                style={[s.input, multiline && { height: 96, textAlignVertical: "top" }]}
                multiline={multiline}
                placeholderTextColor="#9aa3b2"
                {...props}
            />
        </View>
    );
}

function Message({ message }) {
    if (!message) return null;
    return (
        <View style={[s.msg, message.type === "ok" ? s.msgOk : s.msgErr]}>
            <Text style={{ color: message.type === "ok" ? "#14532d" : "#7f1d1d" }}>{message.texte}</Text>
        </View>
    );
}

// ---------------- Écran 1 : envoyer son thème de stage ----------------
function EcranTheme() {
    const [f, setF] = useState(VIDE);
    const [parcours, setParcours] = useState([{ code: "INFO", nom: "Informatique" }]);
    const [charge, setCharge] = useState(false);
    const [message, setMessage] = useState(null);
    const [decision, setDecision] = useState(null);
    const maj = (k) => (v) => setF((x) => ({ ...x, [k]: v }));

    useEffect(() => { getParcours().then(setParcours).catch(() => {}); }, []);

    const chargerMaFiche = async () => {
        setMessage(null);
        if (!f.matricule.trim()) return setMessage({ type: "err", texte: "Saisissez d'abord votre matricule" });
        setCharge(true);
        try {
            const d = await getFiche(f.matricule);
            setF({ matricule: d.matricule, nom: d.nom, prenom: d.prenom, parcours: d.parcours,
                telephone: d.telephone, date_naissance: dateVersSaisie(d.date_naissance), lieu_naissance: d.lieu_naissance,
                theme: d.theme, description: d.description, technologies: d.technologies, lieu_stage: d.lieu_stage });
            setDecision({ statut: d.theme_statut, commentaire: d.theme_commentaire });
            setMessage({ type: "ok", texte: "Votre fiche a été chargée" });
        } catch (e) { setMessage({ type: "err", texte: e.message }); }
        setCharge(false);
    };

    const envoyer = async () => {
        setMessage(null);
        setCharge(true);
        try {
            const r = await envoyerFiche(f);
            setMessage({ type: "ok", texte: `${r.message} ✓` });
            setDecision({ statut: r.etudiant.theme_statut, commentaire: r.etudiant.theme_commentaire });
        } catch (e) { setMessage({ type: "err", texte: e.message }); }
        setCharge(false);
    };

    return (
        <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
            <Text style={s.titre}>Mon thème de stage</Text>
            <Champ label="Matricule *" value={f.matricule} onChangeText={maj("matricule")} autoCapitalize="characters" placeholder="Ex : 1234 IG" />
            <Pressable onPress={chargerMaFiche} style={s.lien}><Text style={s.lienTexte}>Déjà envoyé ? Charger ma fiche</Text></Pressable>
            <Champ label="Nom *" value={f.nom} onChangeText={maj("nom")} placeholder="Nom de famille" />
            <Champ label="Prénom *" value={f.prenom} onChangeText={maj("prenom")} placeholder="Prénom" />
            <Champ label="Numéro de téléphone" value={f.telephone} onChangeText={maj("telephone")} keyboardType="phone-pad" placeholder="Ex : 034 12 345 67" maxLength={30} />
            <Champ label="Date de naissance *" value={f.date_naissance} onChangeText={(v) => maj("date_naissance")(formaterDateSaisie(v))} keyboardType="numeric" placeholder="JJ/MM/AAAA" maxLength={10} />
            <Champ label="Lieu de naissance *" value={f.lieu_naissance} onChangeText={maj("lieu_naissance")} placeholder="Ex : Antananarivo" maxLength={100} />

            <Text style={s.label}>Parcours *</Text>
            <View style={s.chips}>
                {parcours.map((p) => (
                    <Pressable key={p.code} onPress={() => setF((x) => ({ ...x, parcours: p.code }))}
                        style={[s.chip, f.parcours === p.code && s.chipActif]}>
                        <Text style={[s.chipTexte, f.parcours === p.code && { color: "#fff" }]}>{p.nom}</Text>
                    </Pressable>
                ))}
            </View>

            <Champ label="Lieu de stage" value={f.lieu_stage} onChangeText={maj("lieu_stage")} placeholder="Ex : Entreprise XYZ, Fianarantsoa" maxLength={200} />
            <Champ label="Thème *" value={f.theme} onChangeText={maj("theme")} placeholder="Titre de votre thème" maxLength={255} />
            <Champ label="Description du thème" multiline value={f.description} onChangeText={maj("description")} placeholder="De quoi s'agit-il ?" />
            <Champ label="Techno/Outille utiliser" value={f.technologies} onChangeText={maj("technologies")} placeholder="Ex : React, Node.js, PostgreSQL" />

            <StatutTheme statut={decision?.statut} commentaire={decision?.commentaire} />
            <Message message={message} />
            <Pressable onPress={envoyer} disabled={charge} style={[s.bouton, charge && { opacity: 0.6 }]}>
                {charge ? <ActivityIndicator color="#fff" /> : <Text style={s.boutonTexte}>Envoyer</Text>}
            </Pressable>
        </ScrollView>
    );
}

// ---------------- Écran 2 : consulter son planning ----------------
function EcranPlanning() {
    const [matricule, setMatricule] = useState("");
    const [data, setData] = useState(null);
    const [charge, setCharge] = useState(false);
    const [message, setMessage] = useState(null);

    const voir = async () => {
        setMessage(null); setData(null); setCharge(true);
        try { setData(await getPlanning(matricule)); }
        catch (e) { setMessage({ type: "err", texte: e.message }); }
        setCharge(false);
    };

    const sout = data?.soutenance;
    const dateLongue = sout ? new Date(sout.date_soutenance + "T00:00:00").toLocaleDateString("fr-FR",
        { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";

    return (
        <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
            <Text style={s.titre}>Ma soutenance</Text>
            <Champ label="Matricule" value={matricule} onChangeText={setMatricule} autoCapitalize="characters" placeholder="Ex : 1234 IG" />
            <Message message={message} />
            <Pressable onPress={voir} disabled={charge || !matricule.trim()} style={[s.bouton, (charge || !matricule.trim()) && { opacity: 0.6 }]}>
                {charge ? <ActivityIndicator color="#fff" /> : <Text style={s.boutonTexte}>Voir mon planning</Text>}
            </Pressable>

            {data && (
                <View style={s.carte}>
                    <Text style={s.carteNom}>{data.etudiant.prenom} {data.etudiant.nom}</Text>
                    <Text style={s.carteSous}>{data.etudiant.parcours_nom}{data.etudiant.theme ? ` — ${data.etudiant.theme}` : ""}</Text>
                    {data.etudiant.lieu_stage ? <Text style={s.carteSous}>Stage : {data.etudiant.lieu_stage}</Text> : null}
                    <StatutTheme statut={data.etudiant.theme_statut} commentaire={data.etudiant.theme_commentaire} />
                    {sout ? (
                        <View style={{ marginTop: 12 }}>
                            <Ligne k="Date" v={dateLongue} />
                            <Ligne k="Heure" v={`${sout.heure_debut} – ${sout.heure_fin}`} />
                            <Ligne k="Salle" v={sout.nom_salle + (sout.localisation ? ` (${sout.localisation})` : "")} />
                            <Ligne k="Évaluateur" v={`${sout.evaluateur_prenom} ${sout.evaluateur_nom}`} />
                        </View>
                    ) : (
                        <Text style={{ marginTop: 12, color: "#475569" }}>
                            Votre planning n'est pas encore publié par la scolarité. Revenez plus tard.
                        </Text>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const Ligne = ({ k, v }) => (
    <View style={s.ligne}><Text style={s.ligneK}>{k}</Text><Text style={s.ligneV}>{v}</Text></View>
);

// ---------------- Application ----------------
export default function App() {
    const [onglet, setOnglet] = useState("theme");
    return (
        <SafeAreaView style={s.racine}>
            <StatusBar style="light" />
            <View style={s.entete}><Text style={s.enteteTexte}>EMIT — Soutenances</Text></View>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                {onglet === "theme" ? <EcranTheme /> : <EcranPlanning />}
            </KeyboardAvoidingView>
            <View style={s.onglets}>
                {[["theme", "Mon thème"], ["planning", "Planning"]].map(([id, nom]) => (
                    <Pressable key={id} onPress={() => setOnglet(id)} style={[s.onglet, onglet === id && s.ongletActif]}>
                        <Text style={[s.ongletTexte, onglet === id && { color: BLEU, fontWeight: "700" }]}>{nom}</Text>
                    </Pressable>
                ))}
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    racine: { flex: 1, backgroundColor: "#f1f5f9", paddingTop: Platform.OS === "android" ? 24 : 0 },
    entete: { backgroundColor: BLEU, padding: 16 },
    enteteTexte: { color: "#fff", fontSize: 18, fontWeight: "700" },
    page: { padding: 16, paddingBottom: 40, maxWidth: 560, width: "100%", alignSelf: "center" },
    titre: { fontSize: 22, fontWeight: "700", color: "#0f172a", marginBottom: 12 },
    champ: { marginBottom: 12 },
    label: { fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 4 },
    input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, padding: 12, fontSize: 15 },
    lien: { marginBottom: 12, marginTop: -6 },
    lienTexte: { color: BLEU, fontSize: 13, textDecorationLine: "underline" },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
    chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: "#cbd5e1", backgroundColor: "#fff" },
    chipActif: { backgroundColor: BLEU, borderColor: BLEU },
    chipTexte: { color: "#334155", fontSize: 14 },
    bouton: { backgroundColor: BLEU, padding: 14, borderRadius: 10, alignItems: "center", marginTop: 4 },
    boutonTexte: { color: "#fff", fontWeight: "700", fontSize: 16 },
    msg: { padding: 10, borderRadius: 8, marginBottom: 8 },
    msgOk: { backgroundColor: "#dcfce7" },
    msgErr: { backgroundColor: "#fee2e2" },
    carte: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginTop: 16, borderWidth: 1, borderColor: "#e2e8f0" },
    carteNom: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
    carteSous: { color: "#64748b", marginTop: 2 },
    ligne: { flexDirection: "row", paddingVertical: 6, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
    ligneK: { width: 90, color: "#64748b" },
    ligneV: { flex: 1, color: "#0f172a", fontWeight: "600" },
    onglets: { flexDirection: "row", backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#e2e8f0" },
    onglet: { flex: 1, padding: 14, alignItems: "center" },
    ongletActif: { borderTopWidth: 2, borderTopColor: BLEU },
    ongletTexte: { color: "#64748b" },
});
