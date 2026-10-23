const { handleError } = require("./_helpers");

// Contrôleur CRUD générique : model = modèle crudModel, required = champs obligatoires,
// prepare = nettoyage des données, scoped = filtre par mention (req.mention)
module.exports = ({ model, label, required = [], prepare = (d) => d, scoped = false }) => {
    const scope = (req) => (scoped ? req.mention.id_mention : undefined);

    const valider = (data) => {
        const manquants = required.filter((f) => data[f] === null || data[f] === undefined || data[f] === "");
        return manquants.length ? `Champs obligatoires : ${manquants.join(", ")}` : null;
    };

    return {
        list: async (req, res) => {
            try {
                res.json(await model.list(scope(req)));
            } catch (e) {
                handleError(res, e);
            }
        },
        create: async (req, res) => {
            try {
                const data = prepare(req.body || {});
                const erreur = valider(data);
                if (erreur) return res.status(400).json({ message: erreur });
                res.status(201).json(await model.create(data, scope(req)));
            } catch (e) {
                handleError(res, e);
            }
        },
        update: async (req, res) => {
            try {
                const data = prepare(req.body || {});
                const erreur = valider(data);
                if (erreur) return res.status(400).json({ message: erreur });
                const row = await model.update(Number(req.params.id), data, scope(req));
                if (!row) return res.status(404).json({ message: `${label} introuvable` });
                res.json(row);
            } catch (e) {
                handleError(res, e);
            }
        },
        remove: async (req, res) => {
            try {
                const row = await model.remove(Number(req.params.id), scope(req));
                if (!row) return res.status(404).json({ message: `${label} introuvable` });
                res.json({ message: `${label} supprimé(e)` });
            } catch (e) {
                handleError(res, e);
            }
        },
    };
};
