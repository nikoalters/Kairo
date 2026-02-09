import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importante para acceso directo
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
    Alert,
    Image,
    RefreshControl,
    SafeAreaView, ScrollView,
    StyleSheet, Text,
    TouchableOpacity,
    View
} from 'react-native';

// Librerías para Backup
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { borrarTodo, leerDinero, leerHabitos, leerMinutos } from '../utils/storage';

export default function ProfileScreen() {
    const [loading, setLoading] = useState(false);

    // Datos del Usuario RPG
    const [stats, setStats] = useState({
        dinero: 0,
        minutos: 0,
        habitosCompletados: 0,
        nivel: 1,
        xpTotal: 0,
        clase: "Novato"
    });

    useFocusEffect(
        useCallback(() => {
            cargarPerfil();
        }, [])
    );

    const cargarPerfil = async () => {
        setLoading(true);

        const dinero = await leerDinero() || 0;
        const minutos = await leerMinutos() || 0;
        const habitos = await leerHabitos() || [];

        const countHabitos = habitos.filter(h => h.completado).length;

        // FÓRMULA DE XP
        const xpDinero = Math.floor(dinero / 1000);
        const xpHabitos = countHabitos * 50;
        const xpTiempo = minutos;
        const xpTotal = xpDinero + xpHabitos + xpTiempo;
        const nivel = Math.floor(xpTotal / 1000) + 1;

        let clase = "Nómada Digital";
        if (nivel >= 5) clase = "Freelancer";
        if (nivel >= 10) clase = "SysAdmin";
        if (nivel >= 20) clase = "Netrunner";
        if (nivel >= 50) clase = "Cyber-Lord";

        setStats({ dinero, minutos, habitosCompletados: countHabitos, nivel, xpTotal, clase });
        setLoading(false);
    };

    // --- LÓGICA DE BACKUP (EXPORTAR) ---
    const exportarBackup = async () => {
        try {
            // 1. Recopilar TODA la data
            const keys = ['kairo_saldo', 'kairo_movimientos', 'kairo_metas_lista', 'kairo_habitos', 'kairo_minutos', 'kairo_skills'];
            const data = await AsyncStorage.multiGet(keys);

            // Convertir a Objeto JSON limpio
            const backupData = {};
            data.forEach(([key, value]) => {
                backupData[key] = value ? JSON.parse(value) : null;
            });

            // Agregar metadatos
            backupData.timestamp = new Date().toISOString();
            backupData.version = "1.0";

            // 2. Crear archivo temporal
            const fileUri = FileSystem.documentDirectory + 'kairo_backup.json';
            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));

            // 3. Compartir archivo
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/json',
                    dialogTitle: 'Guardar Backup de Kairo'
                });
            } else {
                Alert.alert("Error", "Compartir no está disponible en este dispositivo");
            }
        } catch (error) {
            Alert.alert("Error Exportando", error.message);
        }
    };

    // --- LÓGICA DE RESTORE (IMPORTAR) ---
    const importarBackup = async () => {
        try {
            // 1. Abrir selector de archivos
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            const file = result.assets[0];

            // 2. Leer contenido
            const jsonString = await FileSystem.readAsStringAsync(file.uri);
            const backupData = JSON.parse(jsonString);

            // 3. Validar (básico)
            if (!backupData.kairo_saldo && !backupData.kairo_minutos) {
                Alert.alert("Error", "El archivo no parece ser un backup válido de Kairo.");
                return;
            }

            // 4. Confirmar restauración
            Alert.alert(
                "Restaurar Datos",
                "Esto SOBRESCRIBIRÁ todos tus datos actuales con los del archivo. ¿Continuar?",
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Sí, Restaurar",
                        onPress: async () => {
                            // Guardar todo en AsyncStorage
                            const pairs = [
                                ['kairo_saldo', JSON.stringify(backupData.kairo_saldo || 0)],
                                ['kairo_movimientos', JSON.stringify(backupData.kairo_movimientos || [])],
                                ['kairo_metas_lista', JSON.stringify(backupData.kairo_metas_lista || [])],
                                ['kairo_habitos', JSON.stringify(backupData.kairo_habitos || [])],
                                ['kairo_minutos', JSON.stringify(backupData.kairo_minutos || 0)],
                                ['kairo_skills', JSON.stringify(backupData.kairo_skills || [])],
                            ];

                            await AsyncStorage.multiSet(pairs);
                            Alert.alert("¡Éxito!", "Datos restaurados correctamente. Recargando...");
                            cargarPerfil();
                        }
                    }
                ]
            );

        } catch (error) {
            Alert.alert("Error Importando", "El archivo está dañado o no es compatible.");
        }
    };

    const confirmarBorrado = () => {
        Alert.alert(
            "⚠ ZONA DE PELIGRO",
            "¿Estás seguro de hacer un Factory Reset? Se borrará todo. No hay vuelta atrás.",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "SÍ, BORRAR TODO", style: "destructive", onPress: async () => { await borrarTodo(); Alert.alert("Reinicio", "Sistema formateado."); cargarPerfil(); } }
            ]
        );
    };

    const xpParaSiguienteNivel = stats.nivel * 1000;
    const progresoNivel = (stats.xpTotal % 1000) / 1000 * 100;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={cargarPerfil} tintColor="#38bdf8" />}
            >

                {/* ID Card */}
                <View style={styles.idCard}>
                    <View style={styles.headerRow}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: 'https://img.freepik.com/premium-vector/cyberpunk-boy-avatar-portrait-young-man-futuristic-style-vector-illustration_198565-1748.jpg' }}
                                style={styles.avatarImage}
                                resizeMode="cover"
                            />
                        </View>
                        <View style={styles.idInfo}>
                            <Text style={styles.username}>Nico Soto</Text>
                            <Text style={styles.userClass}>{stats.clase}</Text>
                            <View style={styles.levelBadge}><Text style={styles.levelText}>LVL {stats.nivel}</Text></View>
                        </View>
                    </View>
                    <View style={styles.xpSection}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                            <Text style={styles.xpLabel}>Progreso de Sistema</Text>
                            <Text style={styles.xpValue}>{stats.xpTotal} / {xpParaSiguienteNivel} XP</Text>
                        </View>
                        <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${progresoNivel}%` }]} /></View>
                    </View>
                </View>

                {/* Atributos */}
                <Text style={styles.sectionTitle}>Atributos</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <View style={[styles.iconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}><Ionicons name="hardware-chip" size={24} color="#38bdf8" /></View>
                        <Text style={styles.statValue}>{stats.minutos}</Text><Text style={styles.statLabel}>INT (Mins)</Text>
                    </View>
                    <View style={styles.statBox}>
                        <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}><Ionicons name="checkbox" size={24} color="#f59e0b" /></View>
                        <Text style={styles.statValue}>{stats.habitosCompletados}</Text><Text style={styles.statLabel}>DIS (Hab)</Text>
                    </View>
                    <View style={styles.statBox}>
                        <View style={[styles.iconCircle, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}><Ionicons name="cash" size={24} color="#22c55e" /></View>
                        <Text style={styles.statValue}>{Math.floor(stats.dinero / 1000)}k</Text><Text style={styles.statLabel}>ECO (CLP)</Text>
                    </View>
                </View>

                {/* Sistema */}
                <Text style={styles.sectionTitle}>Sistema de Datos</Text>

                <TouchableOpacity style={styles.optionRow} onPress={exportarBackup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="cloud-upload-outline" size={24} color="#38bdf8" />
                        <Text style={[styles.optionText, { color: '#38bdf8' }]}>Generar Backup (JSON)</Text>
                    </View>
                    <Ionicons name="share-outline" size={20} color="#64748b" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionRow} onPress={importarBackup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="cloud-download-outline" size={24} color="#f59e0b" />
                        <Text style={[styles.optionText, { color: '#f59e0b' }]}>Restaurar Datos</Text>
                    </View>
                    <Ionicons name="document-text-outline" size={20} color="#64748b" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.optionRow, { borderBottomWidth: 0, marginTop: 20 }]} onPress={confirmarBorrado}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="trash-bin-outline" size={24} color="#ef4444" />
                        <Text style={[styles.optionText, { color: '#ef4444' }]}>Factory Reset</Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.versionText}>KAIRO OS v1.0.4 Beta</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    content: { padding: 20 },
    idCard: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#334155' },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatarContainer: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#38bdf8', overflow: 'hidden', marginRight: 20, backgroundColor: '#000' },
    avatarImage: { width: '100%', height: '100%' },
    idInfo: { flex: 1 },
    username: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    userClass: { color: '#94a3b8', fontSize: 14, marginBottom: 8 },
    levelBadge: { backgroundColor: '#38bdf8', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    levelText: { color: '#0f172a', fontWeight: 'bold', fontSize: 12 },
    xpSection: { marginTop: 10 },
    xpLabel: { color: '#64748b', fontSize: 12, marginBottom: 5 },
    xpValue: { color: '#f8fafc', fontSize: 12, fontWeight: 'bold' },
    progressBarBg: { height: 8, backgroundColor: '#0f172a', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#38bdf8', borderRadius: 4 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    statBox: { backgroundColor: '#1e293b', width: '30%', padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
    iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    statValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    statLabel: { color: '#64748b', fontSize: 12, marginTop: 2 },
    optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
    optionText: { color: '#cbd5e1', fontSize: 16, marginLeft: 15 },
    versionText: { textAlign: 'center', color: '#475569', marginTop: 30, fontSize: 12, fontFamily: 'monospace' }
});