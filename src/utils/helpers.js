export const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 12) {
        return 'Buenos días, Nico ☀️';
    } else if (hora >= 12 && hora < 20) {
        return 'Buenas tardes, Nico 🌤️';
    } else {
        return 'Buenas noches, Nico 🌙';
    }
};

const BIBLIOTECA_GLOBAL = [
    { texto: "El único modo de hacer un gran trabajo es amar lo que haces.", autor: "Steve Jobs", tipo: "Sugerido" },
    { texto: "La simplicidad es la máxima sofisticación.", autor: "Leonardo da Vinci", tipo: "Sugerido" },
    { texto: "No cuentes los días, haz que los días cuenten.", autor: "Muhammad Ali", tipo: "Sugerido" },
    { texto: "La tecnología es mejor cuando une a la gente.", autor: "Matt Mullenweg", tipo: "Sugerido" }
];

const BIBLIOTECA_USUARIO = [
    { texto: "No te preocupes por el fruto de tus acciones: mantente atento a la acción misma.", autor: "El Poder del Ahora", tipo: "Personal" },
    { texto: "Tus ingresos pueden crecer únicamente hasta donde crezcas tú.", autor: "Mente Millonaria", tipo: "Personal" }
];

export const obtenerFraseAleatoria = () => {
    let fuenteFrases = BIBLIOTECA_USUARIO;

    if (BIBLIOTECA_USUARIO.length === 0) {
        fuenteFrases = BIBLIOTECA_GLOBAL;
    }

    const indice = Math.floor(Math.random() * fuenteFrases.length);
    return fuenteFrases[indice];
};