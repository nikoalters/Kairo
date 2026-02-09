import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
    Alert, KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { obtenerFraseAleatoria, obtenerSaludo } from '../utils/helpers';
import { guardarHabitos, leerDinero, leerHabitos, leerMinutos } from '../utils/storage';

export default function HomeScreen() {
    const [saludo, setSaludo] = useState('');
    const [frase, setFrase] = useState({ texto: '', autor: '' });

    // Datos
    const [saldoActual, setSaldoActual] = useState(0);
    const [minutosEnfoque, setMinutosEnfoque] = useState(0);
    const [habitos, setHabitos] = useState([]);

    // Modal Nuevo Hábito
    const [modalVisible, setModalVisible] = useState(false);
    const [textoNuevoHabito, setTextoNuevoHabito] = useState('');

    useFocusEffect(
        useCallback(() => {
            cargarDatos();
        }, [])
    );

    const cargarDatos = async () => {
        setSaludo(obtenerSaludo());
        setFrase(obtenerFraseAleatoria());
        setSaldoActual(await leerDinero() || 0);
        setMinutosEnfoque(await leerMinutos() || 0);
        setHabitos(await leerHabitos() || []);
    };

    // --- LÓGICA DE HÁBITOS ---
    const toggleHabito = async (id) => {
        const nuevosHabitos = habitos.map(h => {
            if (h.id === id) return { ...h, completado: !h.completado };
            return h;
        });
        setHabitos(nuevosHabitos);
        await guardarHabitos(nuevosHabitos);
    };

    const agregarHabito = async () => {
        if (!textoNuevoHabito.trim()) return;

        const nuevo = {
            id: Date.now(), // ID único basado en la hora
            texto: textoNuevoHabito,
            completado: false
        };

        const listaActualizada = [...habitos, nuevo];
        setHabitos(listaActualizada);
        await guardarHabitos(listaActualizada);

        setModalVisible(false);
        setTextoNuevoHabito('');
    };

    const confirmarEliminar = (id) => {
        Alert.alert(
            "Eliminar Hábito",
            "¿Quieres quitar esto de tu rutina?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => eliminarHabito(id)
                }
            ]
        );
    };

    const eliminarHabito = async (id) => {
        const listaFiltrada = habitos.filter(h => h.id !== id);
        setHabitos(listaFiltrada);
        await guardarHabitos(listaFiltrada);
    };

    // Formateadores
    const formatoDinero = (valor) => '$ ' + valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const habitosCompletados = habitos.filter(h => h.completado).length;
    const progresoDia = habitos.length > 0 ? (habitosCompletados / habitos.length) * 100 : 0;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.content}>

                {/* Header */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.greeting}>{saludo}</Text>
                        <Text style={styles.subtitle}>Sistema Operativo Personal</Text>
                    </View>
                    <View style={[styles.circularProgress, { borderColor: progresoDia === 100 ? '#f59e0b' : '#38bdf8' }]}>
                        <Text style={[styles.progressText, { color: progresoDia === 100 ? '#f59e0b' : '#38bdf8' }]}>
                            {Math.round(progresoDia)}%
                        </Text>
                    </View>
                </View>

                {/* Dashboard */}
                <View style={styles.dashboardGrid}>
                    <View style={styles.dashboardItem}>
                        <Ionicons name="wallet-outline" size={24} color="#22c55e" />
                        <Text style={styles.dashLabel}>Saldo</Text>
                        <Text style={styles.dashValue}>{formatoDinero(saldoActual)}</Text>
                    </View>
                    <View style={styles.dashboardItem}>
                        <Ionicons name="hourglass-outline" size={24} color="#f59e0b" />
                        <Text style={styles.dashLabel}>Enfoque</Text>
                        <Text style={styles.dashValue}>{minutosEnfoque} m</Text>
                    </View>
                </View>

                {/* --- SECCIÓN HÁBITOS --- */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Protocolo Diario</Text>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Ionicons name="add-circle-outline" size={24} color="#38bdf8" />
                    </TouchableOpacity>
                </View>

                <View style={styles.habitsContainer}>
                    {habitos.length === 0 ? (
                        <Text style={{ color: '#64748b', textAlign: 'center', fontStyle: 'italic' }}>
                            No hay misiones activas. ¡Agrega una!
                        </Text>
                    ) : (
                        habitos.map((habito) => (
                            <TouchableOpacity
                                key={habito.id}
                                style={[styles.habitRow, habito.completado && styles.habitRowDone]}
                                onPress={() => toggleHabito(habito.id)}
                                onLongPress={() => confirmarEliminar(habito.id)} // <--- BORRAR AL MANTENER
                                delayLongPress={500}
                            >
                                <View style={[styles.checkbox, habito.completado && styles.checkboxChecked]}>
                                    {habito.completado && <Ionicons name="checkmark" size={18} color="#0f172a" />}
                                </View>
                                <Text style={[styles.habitText, habito.completado && styles.habitTextDone]}>
                                    {habito.texto}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Quote */}
                <View style={styles.quoteCard}>
                    <Ionicons name="chatbox-ellipses-outline" size={24} color="#38bdf8" style={{ marginBottom: 10 }} />
                    <Text style={styles.quoteText}>"{frase.texto}"</Text>
                    <Text style={styles.quoteAuthor}>— {frase.autor}</Text>
                </View>

            </ScrollView>

            {/* --- MODAL NUEVO HÁBITO --- */}
            <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nueva Misión 📝</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Leer 10 min..."
                            placeholderTextColor="#64748b"
                            value={textoNuevoHabito}
                            onChangeText={setTextoNuevoHabito}
                            autoFocus={true}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={agregarHabito}>
                                <Text style={styles.btnText}>Agregar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    content: { padding: 25 },

    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    greeting: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc' },
    subtitle: { fontSize: 14, color: '#94a3b8' },
    circularProgress: { width: 50, height: 50, borderRadius: 25, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
    progressText: { fontWeight: 'bold', fontSize: 12 },

    dashboardGrid: { flexDirection: 'row', gap: 15, marginBottom: 30 },
    dashboardItem: { flex: 1, backgroundColor: '#1e293b', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
    dashLabel: { color: '#94a3b8', fontSize: 12, marginTop: 5 },
    dashValue: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold', marginTop: 2 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: 1 },
    habitsContainer: { backgroundColor: '#1e293b', borderRadius: 16, padding: 10, marginBottom: 30, minHeight: 80, justifyContent: 'center' },
    habitRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
    habitRowDone: { opacity: 0.5 },
    checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#38bdf8', marginRight: 15, justifyContent: 'center', alignItems: 'center' },
    checkboxChecked: { backgroundColor: '#38bdf8' },
    habitText: { color: '#f1f5f9', fontSize: 16, fontWeight: '500' },
    habitTextDone: { textDecorationLine: 'line-through', color: '#94a3b8' },

    quoteCard: { backgroundColor: '#1e293b', padding: 25, borderRadius: 16, marginBottom: 30, borderLeftWidth: 4, borderLeftColor: '#64748b' },
    quoteText: { color: '#e2e8f0', fontSize: 16, fontStyle: 'italic', marginBottom: 15, lineHeight: 24 },
    quoteAuthor: { color: '#64748b', fontSize: 14, fontWeight: 'bold', textAlign: 'right' },

    // Modal Styles
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' },
    modalContent: { width: '85%', backgroundColor: '#1e293b', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#38bdf8' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#f8fafc', marginBottom: 20, textAlign: 'center' },
    input: { backgroundColor: '#0f172a', color: '#fff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginBottom: 20, fontSize: 16 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    btn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center' },
    btnCancel: { backgroundColor: '#334155', marginRight: 10 },
    btnSave: { backgroundColor: '#38bdf8' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});