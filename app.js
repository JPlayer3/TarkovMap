// --- マップの初期設定 ---
const MAP_HEIGHT = 7832; // 高さ（Y座標の最大値）
const MAP_WIDTH = 5016; // 幅（X座標の最大値）
// [Ymin, Xmin] と [Ymax, Xmax] で境界を設定
const mapBounds = [[0, 0], [MAP_HEIGHT, MAP_WIDTH]];

// マップを初期化し、カスタム座標系 (CRS.Simple) を設定
const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -3,
    maxZoom: 2,
center: [MAP_HEIGHT / 2, MAP_WIDTH / 2], // 中心座標も変更
    zoom: -1
});

// マップの境界を設定し、画面外へのスクロールを防止
map.setMaxBounds(mapBounds);

// --- カスタムマップ画像の読み込み ---
// 🚨 Placeholder: 実際のカスタムマップ画像 (例: customs.png) へのパスに置き換えてください
L.imageOverlay('assets/tiles/customs.png', mapBounds).addTo(map);


// --- マーカーデータの処理と描画 ---
const markerLayers = {}; 
const DEFAULT_ICON_SIZE = [32, 32];
const JSON_URL = 'data/customs_markers.json';

fetch(JSON_URL)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        data.forEach(markerData => {
            const type = markerData.type;
            
            // 該当するマーカータイプ (例: Exfil, Loot) の LayerGroup がまだなければ作成
            if (!markerLayers[type]) {
                // 新しいレイヤーグループを作成し、デフォルトでマップに追加
                markerLayers[type] = new L.LayerGroup().addTo(map); 
            }

            // マーカーアイコンの設定
            // 🚨 Placeholder: アイコンの画像パスはassets/icons/から読み込まれます
            const customIcon = L.icon({
                iconUrl: `assets/icons/${markerData.icon}`,
                iconSize: DEFAULT_ICON_SIZE
            });

            // マーカーを作成
            // Fandomのデータは通常[x, y]なので、Leafletの[y, x]に合わせて座標を入れ替えています
            const coords = [markerData.coords[0], markerData.coords[1]];

            L.marker(coords, { icon: customIcon })
                .bindPopup(`
                    <h3>${markerData.name} (${type})</h3>
                    <p>${markerData.description}</p>
                `)
                .addTo(markerLayers[type]);
        });
        
        // --- レイヤーコントローラーの追加 ---
        // これにより、マーカータイプ (LayerGroup) ごとの表示/非表示を切り替えられるようになります
        L.control.layers(null, markerLayers, {
            collapsed: false // コントロールを常に展開しておく (Fandomのように)
        }).addTo(map);
    })
    .catch(error => {
        console.error('マーカーデータの読み込み中にエラーが発生しました:', error);
        alert('マーカーデータの読み込みに失敗しました。コンソールを確認してください。');
    });