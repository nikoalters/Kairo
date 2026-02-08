import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { guardarMinutos, leerMinutos } from '../utils/storage';

export default function CerebroScreen() {
    const [segundos, setSegundos] = useState(25 * 60);
    const [activo, setActivo] = useState(false);
    const [minutosAcumulados, setMinutosAcumulados] = useState(0);

    // --- VARIABLES DE GAMIFICACIÓN ---
    const XP_POR_MINUTO = 10;
    const XP_PARA_SIGUIENTE_NIVEL = 500; // 50 minutos para subir nivel

    // Calculamos todo al vuelo
    const xpTotal = minutosAcumulados * XP_POR_MINUTO;
    const nivelActual = Math.floor(xpTotal / XP_PARA_SIGUIENTE_NIVEL) + 1;

    // Cálculo de la barra de progreso (0% a 100%)
    const xpEnNivelActual = xpTotal % XP_PARA_SIGUIENTE_NIVEL;
    const porcentajeBarra = (xpEnNivelActual / XP_PARA_SIGUIENTE_NIVEL) * 100;

    // Función para obtener títulos serios
    const obtenerTitulo = (lvl) => {
        if (lvl < 5) return "Novato";
        if (lvl < 10) return "Aprendiz";
        if (lvl < 20) return "Junior Dev";
        if (lvl < 30) return "Semi-Senior";
        return "Senior Architect";
    };

    useEffect(() => {
        const cargarTiempo = async () => {
            const guardado = await leerMinutos();
            setMinutosAcumulados(guardado || 0);
        };
        cargarTiempo();
    }, []);

    useEffect(() => {
        let intervalo = null;
        if (activo && segundos > 0) {
            intervalo = setInterval(() => {
                setSegundos(segundos => segundos - 1);
            }, 1000);
        } else if (segundos === 0 && activo) {
            setActivo(false);
            Vibration.vibrate();
            finalizarSesion();
        }
        return () => clearInterval(intervalo);
    }, [activo, segundos]);

    const finalizarSesion = async () => {
        const nuevosMinutos = minutosAcumulados + 25;
        setMinutosAcumulados(nuevosMinutos);
        await guardarMinutos(nuevosMinutos);
        Alert.alert("¡Sesión Completada!", `+250 XP ganados. ¡Sigue así!`);
        setSegundos(25 * 60);
    };

    const formatoTiempo = (tiempo) => {
        const mins = Math.floor(tiempo / 60);
        const segs = tiempo % 60;
        return `${mins < 10 ? '0' + mins : mins}:${segs < 10 ? '0' + segs : segs}`;
    };

    const debugSumarTiempo = async () => {
        const nuevosMinutos = minutosAcumulados + 10; // Suma 10 mins para probar rápido
        setMinutosAcumulados(nuevosMinutos);
        await guardarMinutos(nuevosMinutos);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <Text style={styles.headerTitle}>Mi Cerebro Digital</Text>

                {/* --- TARJETA DE NIVEL (NUEVA) --- */}
                <View style={styles.levelCard}>
                    <View style={styles.levelInfo}>
                        <View>
                            <Text style={styles.levelLabel}>Nivel Actual</Text>
                            <Text style={styles.levelValue}>{nivelActual}</Text>
                            <Text style={styles.levelTitle}>{obtenerTitulo(nivelActual)}</Text>
                        </View>
                        <View style={styles.xpContainer}>
                            <Text style={styles.xpText}>{Math.floor(xpEnNivelActual)} / {XP_PARA_SIGUIENTE_NIVEL} XP</Text>
                        </View>
                    </View>

                    {/* Barra de Progreso General */}
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${porcentajeBarra}%` }]} />
                    </View>
                </View>

                {/* --- POMODORO --- */}
                <View style={[styles.focusCard, activo && styles.focusCardActive]}>
                    <View>
                        <Text style={styles.focusLabel}>Cronómetro</Text>
                        <Text style={styles.focusTimer}>{formatoTiempo(segundos)}</Text>
                        <Text style={styles.focusStatus}>
                            {activo ? '🔥 Ganando XP...' : 'Listo para estudiar'}
                        </Text>
                    </View>

                    <View style={styles.timerControls}>
                        <TouchableOpacity
                            style={[styles.playButton, activo ? styles.pauseButton : null]}
                            onPress={() => setActivo(!activo)}
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

                {/* --- ESTADÍSTICAS --- */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{minutosAcumulados}</Text>
                        <Text style={styles.statLabel}>Minutos Totales</Text>
                    </View>
                    <TouchableOpacity onPress={debugSumarTiempo} style={styles.statItem}>
                        <Ionicons name="flash" size={24} color="#f59e0b" />
                        <Text style={styles.statLabel}>Cheat (+10m)</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Especialización</Text>
                <View style={styles.skillsContainer}>
                    {/* Habilidad que crece contigo */}
                    <View style={styles.skillItem}>
                        <View style={styles.skillHeader}>
                            <Text style={styles.skillName}>Carrera Profesional</Text>
                            <Text style={styles.skillLevel}>Nvl. {nivelActual}</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            {/* Esta barra refleja tu progreso general */}
                            <View style={[styles.progressBarFill, { width: `${porcentajeBarra}%`, backgroundColor: '#38bdf8' }]} />
                        </View>
                        <Text style={{ color: '#64748b', fontSize: 10, marginTop: 5 }}>
                            Próximo rango: {obtenerTitulo(nivelActual + 1)}
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    scrollContent: { padding: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc', marginBottom: 20 },

    // Level Card (Nueva)
    levelCard: {
        backgroundColor: '#1e293b', padding: 20, borderRadius: 16, marginBottom: 20,
        borderWidth: 1, borderColor: '#334155'
    },
    levelInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 },
    levelLabel: { color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
    levelValue: { color: '#38bdf8', fontSize: 42, fontWeight: 'bold', lineHeight: 42 },
    levelTitle: { color: '#f1f5f9', fontSize: 18, fontWeight: '600' },
    xpContainer: { backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    xpText: { color: '#38bdf8', fontSize: 12, fontWeight: 'bold' },

    // Pomodoro
    focusCard: {
        backgroundColor: '#1e293b', borderRadius: 20, padding: 25, flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
        borderLeftWidth: 4, borderLeftColor: '#334155'
    },
    focusCardActive: { borderLeftColor: '#22c55e', backgroundColor: '#172033' }, // Verde al activar
    focusLabel: { color: '#94a3b8', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' },
    focusTimer: { color: '#ffffff', fontSize: 42, fontWeight: 'bold', fontFamily: 'monospace' },
    focusStatus: { color: '#22c55e', fontSize: 14, fontWeight: '600' },
    timerControls: { alignItems: 'center', gap: 10 },
    playButton: { backgroundColor: '#22c55e', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
    pauseButton: { backgroundColor: '#ef4444' },
    resetButton: { padding: 10 },

    // Stats
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    statItem: { flex: 1, backgroundColor: '#1e293b', padding: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },
    statValue: { color: '#f8fafc', fontSize: 24, fontWeight: 'bold' },
    statLabel: { color: '#94a3b8', fontSize: 12, marginTop: 4 },

    // Skills
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginBottom: 15 },
    skillsContainer: { backgroundColor: '#1e293b', padding: 15, borderRadius: 16, marginBottom: 30 },
    skillItem: { marginBottom: 15 },
    skillHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    skillName: { color: '#e2e8f0', fontWeight: 'bold', fontSize: 15 },
    skillLevel: { color: '#38bdf8', fontWeight: 'bold', fontSize: 12 },
    progressBarBg: { height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#38bdf8', borderRadius: 4 },
});