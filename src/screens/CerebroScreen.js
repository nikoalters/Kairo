import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView, ScrollView,
    StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';
import { guardarMinutos, guardarSkills, leerMinutos, leerSkills } from '../utils/storage';

export default function CerebroScreen() {
    // Estados del Timer
    const [segundos, setSegundos] = useState(25 * 60);
    const [activo, setActivo] = useState(false);

    // Estados de Datos
    const [minutosGlobales, setMinutosGlobales] = useState(0);
    const [skills, setSkills] = useState([]);
    const [skillSeleccionada, setSkillSeleccionada] = useState(null);

    // Modal Nueva Skill
    const [modalVisible, setModalVisible] = useState(false);
    const [nombreSkill, setNombreSkill] = useState('');

    // Constantes RPG
    const XP_POR_SESION = 250; // 25 min = 250 XP

    useFocusEffect(
        useCallback(() => {
            cargarDatos();
        }, [])
    );

    // Efecto del Timer
    useEffect(() => {
        let intervalo = null;
        if (activo && segundos > 0) {
            intervalo = setInterval(() => {
                setSegundos(segundos => segundos - 1);
            }, 1000); // 1000ms = 1s real. (Pon 10 para probar rápido)
        } else if (segundos === 0 && activo) {
            finalizarSesion();
        }
        return () => clearInterval(intervalo);
    }, [activo, segundos]);

    const cargarDatos = async () => {
        const mins = await leerMinutos();
        setMinutosGlobales(mins || 0);

        const listaSkills = await leerSkills();
        setSkills(listaSkills);

        // Si no hay seleccionada, seleccionamos la primera
        if (listaSkills.length > 0 && !skillSeleccionada) {
            setSkillSeleccionada(listaSkills[0].id);
        }
    };

    // --- LÓGICA RPG ---
    const finalizarSesion = async () => {
        setActivo(false);
        Vibration.vibrate();

        // 1. Guardar Minutos Globales
        const nuevosMinutos = minutosGlobales + 25;
        setMinutosGlobales(nuevosMinutos);
        await guardarMinutos(nuevosMinutos);

        // 2. Dar XP a la Skill Seleccionada
        if (skillSeleccionada) {
            const skillsActualizadas = skills.map(s => {
                if (s.id === skillSeleccionada) {
                    let nuevaXP = s.xpActual + XP_POR_SESION;
                    let nuevoNivel = s.nivel;
                    let proximoNivelXP = s.xpSiguiente;

                    // Lógica de Level Up
                    if (nuevaXP >= proximoNivelXP) {
                        nuevaXP = nuevaXP - proximoNivelXP; // El sobrante se pasa al sig nivel
                        nuevoNivel += 1;
                        proximoNivelXP = Math.floor(proximoNivelXP * 1.5); // Cada nivel es más difícil (curva 1.5x)
                        Alert.alert("¡LEVEL UP! 🎉", `Has subido ${s.nombre} a Nivel ${nuevoNivel}`);
                    } else {
                        Alert.alert("Sesión Terminada", `+${XP_POR_SESION} XP para ${s.nombre}`);
                    }

                    return { ...s, nivel: nuevoNivel, xpActual: nuevaXP, xpSiguiente: proximoNivelXP };
                }
                return s;
            });

            setSkills(skillsActualizadas);
            await guardarSkills(skillsActualizadas);
        } else {
            Alert.alert("¡Sesión Terminada!", "No tenías ninguna habilidad seleccionada, pero los minutos se guardaron.");
        }

        setSegundos(25 * 60);
    };

    // --- GESTIÓN SKILLS ---
    const crearSkill = async () => {
        if (!nombreSkill.trim()) return;
        const nueva = {
            id: Date.now(),
            nombre: nombreSkill,
            nivel: 1,
            xpActual: 0,
            xpSiguiente: 500 // XP necesaria para nivel 2
        };
        const lista = [...skills, nueva];
        setSkills(lista);
        setSkillSeleccionada(nueva.id); // La seleccionamos automáticamente
        await guardarSkills(lista);
        setModalVisible(false);
        setNombreSkill('');
    };

    const confirmarBorrarSkill = (skill) => {
        Alert.alert("Eliminar Habilidad", `¿Borrar ${skill.nombre} y todo su progreso?`, [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Borrar", style: "destructive", onPress: async () => {
                    const filtradas = skills.filter(s => s.id !== skill.id);
                    setSkills(filtradas);
                    if (skillSeleccionada === skill.id) setSkillSeleccionada(null);
                    await guardarSkills(filtradas);
                }
            }
        ]);
    };

    // Helpers
    const formatoTiempo = (tiempo) => {
        const mins = Math.floor(tiempo / 60);
        const segs = tiempo % 60;
        return `${mins < 10 ? '0' + mins : mins}:${segs < 10 ? '0' + segs : segs}`;
    };

    const skillActivaData = skills.find(s => s.id === skillSeleccionada);

    // DEBUG: Botón trampa para probar sin esperar 25 min
    const debugCheat = () => {
        setSegundos(2); // Pone el contador en 2 segundos
        setActivo(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <Text style={styles.headerTitle}>Entrenamiento</Text>

                {/* --- CRONÓMETRO --- */}
                <View style={[styles.focusCard, activo && styles.focusCardActive]}>
                    <View>
                        <Text style={styles.focusLabel}>
                            {activo ? 'Entrenando:' : 'Listo para:'}
                        </Text>
                        <Text style={styles.skillTargetName}>
                            {skillActivaData ? skillActivaData.nombre : "Selecciona algo..."}
                        </Text>
                        <Text style={styles.focusTimer}>{formatoTiempo(segundos)}</Text>
                    </View>

                    <View style={styles.timerControls}>
                        <TouchableOpacity
                            style={[styles.playButton, activo ? styles.pauseButton : null]}
                            onPress={() => {
                                if (!skillSeleccionada) {
                                    Alert.alert("¡Espera!", "Primero selecciona una habilidad abajo.");
                                    return;
                                }
                                setActivo(!activo);
                            }}
                        >
                            <Ionicons name={activo ? "pause" : "play"} size={30} color="#fff" />
                        </TouchableOpacity>

                        {!activo && segundos !== 1500 && (
                            <TouchableOpacity style={styles.resetButton} onPress={() => setSegundos(25 * 60)}>
                                <Ionicons name="refresh" size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* --- SELECTOR DE HABILIDADES --- */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Tus Habilidades</Text>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Ionicons name="add-circle" size={28} color="#38bdf8" />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.skillsScroll}>
                    {skills.map((skill) => {
                        const isSelected = skill.id === skillSeleccionada;
                        const porcentaje = (skill.xpActual / skill.xpSiguiente) * 100;

                        return (
                            <TouchableOpacity
                                key={skill.id}
                                style={[styles.skillCard, isSelected && styles.skillCardSelected]}
                                onPress={() => setSkillSeleccionada(skill.id)}
                                onLongPress={() => confirmarBorrarSkill(skill)}
                            >
                                <View style={styles.skillHeader}>
                                    <Text style={[styles.skillName, isSelected && { color: '#fff' }]}>{skill.nombre}</Text>
                                    <Text style={[styles.skillLevel, isSelected && { color: '#38bdf8' }]}>Lv.{skill.nivel}</Text>
                                </View>

                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${porcentaje}%`, backgroundColor: isSelected ? '#38bdf8' : '#64748b' }]} />
                                </View>

                                <Text style={styles.xpText}>{skill.xpActual} / {skill.xpSiguiente} XP</Text>

                                {isSelected && (
                                    <View style={styles.selectedBadge}>
                                        <Ionicons name="checkmark-circle" size={16} color="#38bdf8" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Botón Cheat (Oculto/Debug) */}
                <TouchableOpacity onPress={debugCheat} style={{ alignSelf: 'center', marginTop: 20, opacity: 0.3 }}>
                    <Text style={{ color: '#64748b' }}>⚡ Fast Forward (Test)</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* --- MODAL NUEVA SKILL --- */}
            <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nueva Habilidad 🧠</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Python, Inglés, Guitarra..."
                            placeholderTextColor="#64748b"
                            value={nombreSkill}
                            onChangeText={setNombreSkill}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={crearSkill}>
                                <Text style={styles.btnText}>Crear</Text>
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
    scrollContent: { padding: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc', marginBottom: 20 },

    // Timer Card
    focusCard: {
        backgroundColor: '#1e293b', borderRadius: 20, padding: 25, flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center', marginBottom: 30,
        borderWidth: 1, borderColor: '#334155'
    },
    focusCardActive: { borderColor: '#38bdf8', backgroundColor: '#172033' },
    focusLabel: { color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' },
    skillTargetName: { color: '#38bdf8', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
    focusTimer: { color: '#ffffff', fontSize: 32, fontWeight: 'bold', fontFamily: 'monospace' },
    timerControls: { alignItems: 'center', gap: 10 },
    playButton: { backgroundColor: '#38bdf8', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
    pauseButton: { backgroundColor: '#ef4444' },
    resetButton: { padding: 10 },

    // Skills Section
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc' },
    skillsScroll: { gap: 15, paddingBottom: 20 },

    skillCard: {
        backgroundColor: '#1e293b', width: 140, padding: 15, borderRadius: 16,
        borderWidth: 1, borderColor: '#334155', opacity: 0.7
    },
    skillCardSelected: {
        borderColor: '#38bdf8', opacity: 1, transform: [{ scale: 1.05 }], backgroundColor: '#1e293b'
    },
    skillHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    skillName: { color: '#94a3b8', fontWeight: 'bold', fontSize: 14, flex: 1 },
    skillLevel: { color: '#64748b', fontWeight: 'bold', fontSize: 12 },
    progressBarBg: { height: 6, backgroundColor: '#0f172a', borderRadius: 3, overflow: 'hidden', marginBottom: 5 },
    progressBarFill: { height: '100%', borderRadius: 3 },
    xpText: { color: '#64748b', fontSize: 10, textAlign: 'right' },
    selectedBadge: { position: 'absolute', top: 5, right: 5 },

    // Modal
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