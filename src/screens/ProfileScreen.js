import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borrarTodo, leerDinero, leerMinutos } from '../utils/storage';

export default function ProfileScreen() {
    const [nivel, setNivel] = useState(1);
    const [titulo, setTitulo] = useState("Novato");
    const [minutosTotales, setMinutosTotales] = useState(0);
    const [dineroTotal, setDineroTotal] = useState(0);

    // Lógica de Niveles (Misma que en Cerebro)
    const calcularNivel = (mins) => {
        const XP_POR_MINUTO = 10;
        const XP_PARA_SIGUIENTE_NIVEL = 500;
        const xpTotal = mins * XP_POR_MINUTO;
        return Math.floor(xpTotal / XP_PARA_SIGUIENTE_NIVEL) + 1;
    };

    const obtenerTitulo = (lvl) => {
        if (lvl < 5) return "Novato";
        if (lvl < 10) return "Aprendiz";
        if (lvl < 20) return "Junior Dev";
        if (lvl < 30) return "Semi-Senior";
        return "Senior Architect";
    };

    useFocusEffect(
        useCallback(() => {
            const cargarDatos = async () => {
                // 1. Cargar Tiempo y Calcular Nivel
                const mins = await leerMinutos();
                setMinutosTotales(mins || 0);

                const lvl = calcularNivel(mins || 0);
                setNivel(lvl);
                setTitulo(obtenerTitulo(lvl));

                // 2. Cargar Dinero
                const dinero = await leerDinero();
                setDineroTotal(dinero || 0);
            };
            cargarDatos();
        }, [])
    );

    const handleReset = async () => {
        Alert.alert(
            "¿Reiniciar Sistema?",
            "Esto borrará todo tu dinero y progreso. No hay vuelta atrás.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sí, Borrar Todo",
                    style: "destructive",
                    onPress: async () => {
                        await borrarTodo();
                        // Forzamos actualización visual a cero
                        setNivel(1);
                        setTitulo("Novato");
                        setMinutosTotales(0);
                        setDineroTotal(0);
                    }
                }
            ]
        );
    };

    const formatoDinero = (valor) => {
        return '$ ' + valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* Encabezado del Perfil */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        {/* Puedes cambiar este ícono por una imagen real con <Image /> */}
                        <Ionicons name="person" size={50} color="#cbd5e1" />
                    </View>
                    <Text style={styles.username}>Nico Soto</Text>

                    {/* Rango Dinámico */}
                    <Text style={styles.role}>{titulo}</Text>

                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>NIVEL {nivel}</Text>
                    </View>
                </View>

                {/* Estadísticas Reales */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{minutosTotales}m</Text>
                        <Text style={styles.statLabel}>Tiempo Estudio</Text>
                    </View>
                    <View style={[styles.statItem, styles.statBorder]}>
                        <Text style={styles.statNumber}>{formatoDinero(dineroTotal)}</Text>
                        <Text style={styles.statLabel}>Patrimonio</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>Infinite</Text>
                        <Text style={styles.statLabel}>Potencial</Text>
                    </View>
                </View>

                {/* Menú de Opciones */}
                <View style={styles.menuWrapper}>
                    <Text style={styles.sectionTitle}>Configuración</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <Ionicons name="settings-outline" size={22} color="#38bdf8" />
                        </View>
                        <Text style={styles.menuText}>Editar Perfil</Text>
                        <Ionicons name="chevron-forward" size={20} color="#475569" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <Ionicons name="notifications-outline" size={22} color="#38bdf8" />
                        </View>
                        <Text style={styles.menuText}>Notificaciones</Text>
                        <Ionicons name="chevron-forward" size={20} color="#475569" />
                    </TouchableOpacity>

                    {/* BOTÓN DE RESETEAR (MOVIDO AQUÍ) */}
                    <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0, marginTop: 20 }]} onPress={handleReset}>
                        <View style={[styles.menuIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                            <Ionicons name="trash-outline" size={22} color="#ef4444" />
                        </View>
                        <Text style={[styles.menuText, { color: '#ef4444' }]}>Resetear Fábrica</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    content: { padding: 20, alignItems: 'center' },

    // Header
    header: { alignItems: 'center', marginBottom: 30, width: '100%' },
    avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#38bdf8', marginBottom: 15 },
    username: { color: '#f8fafc', fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    role: { color: '#94a3b8', fontSize: 16, marginBottom: 10 },
    badge: { backgroundColor: 'rgba(34, 197, 94, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#22c55e' },
    badgeText: { color: '#22c55e', fontSize: 12, fontWeight: 'bold' },

    // Stats
    statsContainer: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 16, padding: 20, width: '100%', justifyContent: 'space-between', marginBottom: 30 },
    statItem: { alignItems: 'center', flex: 1 },
    statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#334155' },
    statNumber: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    statLabel: { color: '#64748b', fontSize: 12 },

    // Menu
    menuWrapper: { width: '100%' },
    sectionTitle: { color: '#94a3b8', fontSize: 14, marginBottom: 15, marginLeft: 10, textTransform: 'uppercase', letterSpacing: 1 },
    menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 15, borderRadius: 12, marginBottom: 10 },
    menuIcon: { width: 40, height: 40, backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    menuText: { flex: 1, color: '#f1f5f9', fontSize: 16, fontWeight: '500' },
});