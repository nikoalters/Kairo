import AsyncStorage from '@react-native-async-storage/async-storage';

// --- DINERO (Billetera Disponible) ---
export const guardarDinero = async (monto) => {
    try {
        await AsyncStorage.setItem('kairo_saldo', monto.toString());
    } catch (e) { console.error(e); }
};

export const leerDinero = async () => {
    try {
        const valor = await AsyncStorage.getItem('kairo_saldo');
        return valor != null ? parseInt(valor) : 0;
    } catch (e) { return 0; }
};

// --- MOVIMIENTOS ---
export const guardarMovimientos = async (lista) => {
    try {
        const jsonValue = JSON.stringify(lista);
        await AsyncStorage.setItem('kairo_movimientos', jsonValue);
    } catch (e) { console.error(e); }
};

export const leerMovimientos = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('kairo_movimientos');
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) { return []; }
};

// --- MINUTOS (Cerebro) ---
export const guardarMinutos = async (minutos) => {
    try {
        await AsyncStorage.setItem('kairo_minutos', minutos.toString());
    } catch (e) { console.error(e); }
};

export const leerMinutos = async () => {
    try {
        const valor = await AsyncStorage.getItem('kairo_minutos');
        return valor != null ? parseInt(valor) : 0;
    } catch (e) { return 0; }
};

// --- METAS (NUEVO) ---
export const guardarListaMetas = async (lista) => {
    try {
        const jsonValue = JSON.stringify(lista);
        await AsyncStorage.setItem('kairo_metas_lista', jsonValue);
    } catch (e) { console.error(e); }
};

export const leerListaMetas = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('kairo_metas_lista');
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) { return []; }
};

// --- BORRAR TODO ---
export const borrarTodo = async () => {
    try {
        await AsyncStorage.clear();
    } catch (e) { console.error(e); }
}
// ... (código anterior de metas, dinero, minutos) ...

// --- HÁBITOS (NUEVO) ---
export const guardarHabitos = async (habitos) => {
    try {
        const jsonValue = JSON.stringify(habitos);
        await AsyncStorage.setItem('kairo_habitos', jsonValue);
    } catch (e) { console.error(e); }
};

export const leerHabitos = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('kairo_habitos');
        // Si no hay nada guardado, devolvemos 3 hábitos por defecto
        if (jsonValue == null) {
            return [
                { id: 1, texto: "Leer 10 páginas", completado: false },
                { id: 2, texto: "Beber 2L de agua", completado: false },
                { id: 3, texto: "Código (30 min)", completado: false },
            ];
        }
        return JSON.parse(jsonValue);
    } catch (e) { return []; }
};
// ... (código anterior) ...

// --- SKILLS (Habilidades) ---
export const guardarSkills = async (skills) => {
    try {
        const jsonValue = JSON.stringify(skills);
        await AsyncStorage.setItem('kairo_skills', jsonValue);
    } catch (e) { console.error(e); }
};

export const leerSkills = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('kairo_skills');
        if (jsonValue == null) {
            // Skill por defecto para que no esté vacío
            return [{
                id: 1,
                nombre: "Productividad",
                nivel: 1,
                xpActual: 0,
                xpSiguiente: 100
            }];
        }
        return JSON.parse(jsonValue);
    } catch (e) { return []; }
};