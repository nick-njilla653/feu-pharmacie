import './PharmacySignEditor.css';
import React, { useState } from 'react';
import {
    IonContent,
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    IonInput,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonSegment,
    IonSegmentButton,
    IonLabel,
} from '@ionic/react';
import {
    textOutline,
    brushOutline,
    saveOutline,
    eyeOutline,
    trashOutline,
    downloadOutline,
    cloudUploadOutline,
    alertCircleOutline,
} from 'ionicons/icons';

// Types
interface Pattern {
    name: string;
    matrix: boolean[][];
    timestamp?: string;
}

// Types pour améliorer la sécurité de type
type SegmentType = 'text' | 'draw';


// Patterns prédéfinis
const PREDEFINED_PATTERNS: { [key: string]: number[][] } = {
    'Croix': [
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1]
    ],
    'Plus': [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0]
    ],
    'Étoile': [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0]
    ],
    'Cœur': [
        [0, 1, 1, 0, 0, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ]
};

const PharmacySignEditor: React.FC = () => {
    // États
    const [text, setText] = useState<string>('');
    const [matrix, setMatrix] = useState<boolean[][]>(Array(8).fill(null).map(() => Array(8).fill(false)));
    const [activeTab, setActiveTab] = useState<'text' | 'draw'>('text');
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [binaryPreview, setBinaryPreview] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [savedPatterns, setSavedPatterns] = useState<Pattern[]>([]);
    const [selectedPattern, setSelectedPattern] = useState<string>('');

    // Fonctions utilitaires
    const validateText = (input: string): boolean => {
        const validChars = /^[A-Z0-9\s]*$/;
        if (!validChars.test(input.toUpperCase())) {
            setError('Seuls les lettres, chiffres et espaces sont autorisés');
            return false;
        }
        if (input.length > 20) {
            setError('Le texte ne doit pas dépasser 20 caractères');
            return false;
        }
        setError('');
        return true;
    };

    const convertTextToBinary = (inputText: string): string | null => {
        if (!validateText(inputText)) return null;
        const encoder = new TextEncoder();
        const bytes = encoder.encode(inputText.toUpperCase());
        return Array.from(bytes)
            .map(byte => byte.toString(2).padStart(8, '0'))
            .join('');
    };

    const convertMatrixToBinary = (): string => {
        return matrix.flat().map(cell => cell ? '1' : '0').join('');
    };

    // Gestionnaires d'événements
    const handleMatrixClick = (row: number, col: number): void => {
        setMatrix(prevMatrix =>
            prevMatrix.map((r, i) =>
                i === row
                    ? r.map((c, j) => j === col ? !c : c)
                    : [...r]
            )
        );
    };

    const handleTabChange = (event: CustomEvent) => {
        const newValue = event.detail.value as SegmentType;
        if (newValue === 'text' || newValue === 'draw') {
            setActiveTab(newValue);
            setShowPreview(false);
            setBinaryPreview('');
            setError('');
            setSelectedPattern('');
        }
    };


    const handleImport = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const fileInput = event.target;
        const file = fileInput.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            if (!e.target?.result) return;

            const buffer = e.target.result as ArrayBuffer;
            const bytes = new Uint8Array(buffer);
            const binaryString = Array.from(bytes)
                .map(byte => byte.toString(2).padStart(8, '0'))
                .join('');

            if (activeTab === 'draw') {
                const newMatrix = Array(8).fill(null).map((_, i) =>
                    Array(8).fill(null).map((_, j) => binaryString[i * 8 + j] === '1')
                );
                setMatrix(newMatrix);
            } else {
                const textDecoder = new TextDecoder();
                const decodedText = textDecoder.decode(bytes);
                setText(decodedText);
            }
            generateBinaryPreview();
        };
        reader.readAsArrayBuffer(file);
    };

    // Actions principales
    const generateBinaryPreview = (): void => {
        let binaryString = activeTab === 'text'
            ? convertTextToBinary(text)
            : convertMatrixToBinary();

        if (!binaryString) return;

        // Création du tableau 8x8
        const binaryMatrix = [];
        for (let i = 0; i < 8; i++) {
            const row = [];
            for (let j = 0; j < 8; j++) {
                const index = i * 8 + j;
                row.push(binaryString[index] === '1');
            }
            binaryMatrix.push(row);
        }

        // Pour l'E-PROM 1 (colonnes) : par défaut toutes les colonnes sont à 1 (éteintes)
        let columnPreview = "E-PROM 1 (Contrôle des colonnes - '0' = allumée):\n\n";
        const columnsData = new Uint8Array(8).fill(0xFF); // Initialisation avec tout à 1

        // Vérifier chaque colonne
        for (let col = 0; col < 8; col++) {
            let hasActiveLed = false;
            for (let row = 0; row < 8; row++) {
                if (binaryMatrix[row][col]) {
                    hasActiveLed = true;
                    break;
                }
            }

            if (hasActiveLed) {
                columnsData[col] = ~(1 << col); // Met à 0 uniquement la colonne active
            }

            const binaryRep = columnsData[col].toString(2).padStart(8, '0');
            const hexRep = columnsData[col].toString(16).toUpperCase().padStart(2, '0');
            columnPreview += `Col ${col}: ${binaryRep} (0x${hexRep})\n`;
        }

        // Pour l'E-PROM 2 (lignes) : par défaut toutes les lignes sont à 1 (éteintes)
        let rowPreview = "\nE-PROM 2 (Contrôle des lignes - '1' = éteinte):\n\n";
        const rowsData = new Uint8Array(8).fill(0xFF); // Initialisation avec tout à 1

        for (let col = 0; col < 8; col++) {
            let rowByte = 0xFF; // On commence avec toutes les lignes éteintes
            for (let row = 0; row < 8; row++) {
                if (binaryMatrix[row][col]) {
                    rowByte &= ~(1 << row); // Met à 0 la ligne qui doit être allumée
                }
            }
            rowsData[col] = rowByte;

            const binaryRep = rowsData[col].toString(2).padStart(8, '0');
            const hexRep = rowsData[col].toString(16).toUpperCase().padStart(2, '0');
            rowPreview += `Pos ${col}: ${binaryRep} (0x${hexRep})\n`;
        }

        // Ajouter une visualisation de la matrice LED
        let matrixPreview = "\nMatrice LED (■ = allumée, □ = éteinte):\n\n";
        matrixPreview += "  0 1 2 3 4 5 6 7  <- Colonnes\n";
        for (let row = 0; row < 8; row++) {
            matrixPreview += row + " ";
            for (let col = 0; col < 8; col++) {
                matrixPreview += binaryMatrix[row][col] ? '■ ' : '□ ';
            }
            matrixPreview += "\n";
        }

        // Ajouter une explication du balayage
        let explanation = "\nExplication du balayage :\n";
        explanation += "• Le balayage se fait colonne par colonne\n";
        explanation += "• E-PROM 1 : Active une colonne à la fois (0 = actif)\n";
        explanation += "• E-PROM 2 : Contrôle les LED par ligne (1 = éteint)\n";
        explanation += "• La persistance rétinienne crée l'image complète\n";

        // Combiner tous les aperçus
        const fullPreview = columnPreview + rowPreview + matrixPreview + explanation;
        setBinaryPreview(fullPreview);
        setShowPreview(true);
    };

    const saveCurrentPattern = (): void => {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
        const newPattern: Pattern = {
            name: `Motif ${savedPatterns.length + 1}`,
            matrix: [...matrix.map(row => [...row])],
            timestamp
        };
        setSavedPatterns([...savedPatterns, newPattern]);
    };

    const loadPattern = (pattern: string | Pattern): void => {
        if (typeof pattern === 'string' && PREDEFINED_PATTERNS[pattern]) {
            setMatrix(PREDEFINED_PATTERNS[pattern].map(row =>
                row.map(cell => Boolean(cell))
            ));
            setSelectedPattern(pattern);
        } else if (typeof pattern !== 'string' && pattern.matrix) {
            setMatrix(pattern.matrix);
            setSelectedPattern(pattern.name);
        }
    };

    const exportBinary = (): void => {
        let binaryString = activeTab === 'text'
            ? convertTextToBinary(text)
            : convertMatrixToBinary();

        if (!binaryString) return;

        // Création du tableau 8x8 à partir de la chaîne binaire
        const binaryMatrix = [];
        for (let i = 0; i < 8; i++) {
            const row = [];
            for (let j = 0; j < 8; j++) {
                const index = i * 8 + j;
                row.push(binaryString[index] === '1');
            }
            binaryMatrix.push(row);
        }

        // Générer les données pour les colonnes (E-PROM 1)
        // '0' pour allumer une colonne
        const columnsData = new Uint8Array(8);
        for (let col = 0; col < 8; col++) {
            let colByte = 0xFF; // Toutes les colonnes éteintes par défaut

            // Pour chaque colonne, vérifier s'il y a des LED à allumer
            let hasActiveLed = false;
            for (let row = 0; row < 8; row++) {
                if (binaryMatrix[row][col]) {
                    hasActiveLed = true;
                    break;
                }
            }

            // Si la colonne a des LED actives, on l'allume (mise à 0)
            if (hasActiveLed) {
                colByte = ~(1 << col);
            }

            columnsData[col] = colByte;
        }

        // Générer les données pour les lignes (E-PROM 2)
        // '1' pour éteindre une ligne
        const rowsData = new Uint8Array(8);
        for (let col = 0; col < 8; col++) {
            let rowByte = 0; // Toutes les lignes allumées par défaut
            for (let row = 0; row < 8; row++) {
                // Si le pixel est inactif dans cette colonne, on éteint la ligne (mise à 1)
                if (!binaryMatrix[row][col]) {
                    rowByte |= (1 << row);
                }
            }
            rowsData[col] = rowByte;
        }

        // Création des blobs et téléchargement des fichiers
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const prefix = activeTab === 'text' ? 'text' : 'drawing';

        // E-PROM 1 (Colonnes)
        const columnsBlob = new Blob([columnsData], { type: 'application/octet-stream' });
        const columnsUrl = URL.createObjectURL(columnsBlob);
        const columnsLink = document.createElement('a');
        columnsLink.href = columnsUrl;
        columnsLink.download = `pharmacy-sign-${prefix}-eprom1-columns-${timestamp}.bin`;
        document.body.appendChild(columnsLink);
        columnsLink.click();
        document.body.removeChild(columnsLink);
        URL.revokeObjectURL(columnsUrl);

        // E-PROM 2 (Lignes)
        const rowsBlob = new Blob([rowsData], { type: 'application/octet-stream' });
        const rowsUrl = URL.createObjectURL(rowsBlob);
        const rowsLink = document.createElement('a');
        rowsLink.href = rowsUrl;
        rowsLink.download = `pharmacy-sign-${prefix}-eprom2-rows-${timestamp}.bin`;
        document.body.appendChild(rowsLink);
        rowsLink.click();
        document.body.removeChild(rowsLink);
        URL.revokeObjectURL(rowsUrl);
    };


    const clearContent = (): void => {
        if (activeTab === 'text') {
            setText('');
        } else {
            setMatrix(Array(8).fill(null).map(() => Array(8).fill(false)));
            setSelectedPattern('');
        }
        setBinaryPreview('');
        setShowPreview(false);
        setError('');
    };

    

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>Éditeur de Feux de Pharmacie</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <IonCard>
                    <IonCardContent>
                        <IonSegment value={activeTab} onIonChange={handleTabChange}>
                            <IonSegmentButton value="text">
                                <IonIcon icon={textOutline} />
                                <IonLabel>Mode Texte</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="draw">
                                <IonIcon icon={brushOutline} />
                                <IonLabel>Mode Dessin</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>

                        {activeTab === 'text' ? (
                            <div className="ion-padding">
                                <IonInput
                                    value={text}
                                    onIonChange={e => {
                                        const newText = e.detail.value?.toUpperCase() || '';
                                        setText(newText);
                                        validateText(newText);
                                    }}
                                    placeholder="Entrez votre texte (ex: PHARMACIE)"
                                    className={`custom-input ${error ? 'input-error' : ''}`}
                                />

                                {error && (
                                    <div className="error-message">
                                        <IonIcon icon={alertCircleOutline} />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="ion-padding">
                                <IonCard>
                                    <IonCardHeader>
                                        <IonCardTitle>Motifs prédéfinis</IonCardTitle>
                                    </IonCardHeader>
                                    <IonCardContent>
                                        <IonGrid>
                                            <IonRow>
                                                {Object.entries(PREDEFINED_PATTERNS).map(([name, pattern]) => (
                                                    <IonCol size="6" size-md="3" key={name}>
                                                        <IonButton
                                                            expand="block"
                                                            fill={selectedPattern === name ? "solid" : "outline"}
                                                            onClick={() => loadPattern(name)}
                                                        >
                                                            {name}
                                                        </IonButton>
                                                    </IonCol>
                                                ))}
                                            </IonRow>
                                        </IonGrid>
                                    </IonCardContent>
                                </IonCard>

                                <div className="matrix-grid">
                                    <IonGrid fixed>
                                        {matrix.map((row, i) => (
                                            <IonRow key={i}>
                                                {row.map((cell, j) => (
                                                    <IonCol key={`${i}-${j}`}>
                                                        <div
                                                            className={`matrix-cell ${cell ? 'active' : ''}`}
                                                            onClick={() => handleMatrixClick(i, j)}
                                                        />
                                                    </IonCol>
                                                ))}
                                            </IonRow>
                                        ))}
                                    </IonGrid>
                                </div>

                                {savedPatterns.length > 0 && (
                                    <div className="ion-padding-top">
                                        <IonCard>
                                            <IonCardHeader>
                                                <IonCardTitle>Motifs sauvegardés</IonCardTitle>
                                            </IonCardHeader>
                                            <IonCardContent>
                                                <IonGrid>
                                                    <IonRow>
                                                        {savedPatterns.map((pattern) => (
                                                            <IonCol size="6" size-md="3" key={pattern.timestamp}>
                                                                <IonButton
                                                                    expand="block"
                                                                    fill={selectedPattern === pattern.name ? "solid" : "outline"}
                                                                    onClick={() => loadPattern(pattern)}
                                                                >
                                                                    {pattern.name}
                                                                </IonButton>
                                                            </IonCol>
                                                        ))}
                                                    </IonRow>
                                                </IonGrid>
                                            </IonCardContent>
                                        </IonCard>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="ion-text-center ion-padding-top">
                            <IonCard className="export-card">
                                <IonCardHeader>
                                    <IonCardTitle>Actions et Export</IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <div className="action-buttons">
                                        <IonButton
                                            className="save-button"
                                            color="success"
                                            onClick={saveCurrentPattern}
                                            disabled={activeTab === 'text' && !text}
                                        >
                                            <IonIcon slot="start" icon={saveOutline} />
                                            Sauvegarder
                                        </IonButton>

                                        <IonButton
                                            className="clear-button"
                                            color="danger"
                                            onClick={clearContent}
                                        >
                                            <IonIcon slot="start" icon={trashOutline} />
                                            Effacer
                                        </IonButton>

                                        <IonButton
                                            className="preview-button"
                                            color="secondary"
                                            onClick={generateBinaryPreview}
                                            disabled={activeTab === 'text' && (!!error || !text)}
                                        >
                                            <IonIcon slot="start" icon={eyeOutline} />
                                            Aperçu Binaire
                                        </IonButton>
                                    </div>

                                    <div className="export-buttons">
                                        <IonButton
                                            className="export-button"
                                            onClick={exportBinary}
                                            disabled={activeTab === 'text' && (!!error || !text)}
                                        >
                                            <IonIcon slot="start" icon={downloadOutline} />
                                            Générer fichiers E-PROM
                                        </IonButton>

                                        <IonButton
                                            className="import-button"
                                            onClick={() => {
                                                const fileInput = document.getElementById('fileInput') as HTMLInputElement;
                                                fileInput?.click();
                                            }}
                                        >
                                            <IonIcon slot="start" icon={cloudUploadOutline} />
                                            Importer
                                            <input
                                                id="fileInput"
                                                type="file"
                                                onChange={handleImport}
                                                accept=".bin"
                                                style={{ display: 'none' }}
                                            />
                                        </IonButton>
                                    </div>

                                    {showPreview && (
                                        <div className="export-preview">
                                            <div className="preview-section">
                                                <h4>Aperçu des données binaires</h4>
                                                <pre className="binary-preview">
                                                    {binaryPreview}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </IonCardContent>
                            </IonCard>
                        </div>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default PharmacySignEditor;