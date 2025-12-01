import { defaultLocale, type AppLocale } from "@/i18n";
import { getLocalizedValue } from "@/lib/localization";
import { notionClient } from "@/lib/notion/client";
import { getRichTextValue, getTitleValue, sanitizeUrl } from "@/lib/notion/utils";
import type { LyricsContent, SongDetail } from "@/types/music";
import type {
  NotionPage,
  NotionQueryResponse,
  NotionRichTextProperty,
  NotionSelectProperty,
  NotionTitleProperty,
  NotionUrlProperty,
} from "@/types/notion";

type SongDescriptionKey = `Description (${AppLocale})`;

type LocalizedSongDetail = Omit<SongDetail, "description"> & {
  description?: Record<AppLocale, string>;
};

const fallbackSongs: Record<string, LocalizedSongDetail> = {
  "song-gone": {
    id: "song-gone",
    title: "Gone",
    album: "Awake",
    videoUrl: "https://www.youtube.com/watch?v=m2ekEJ8CNSg",
    videoPlatform: "youtube",
    description: {
      zh: "開場序曲結合敲擊與弦樂，拉開 KNK 宇宙般的戲劇張力。",
      en: "An opening interlude blending percussion and strings to introduce KNK’s cinematic universe.",
      ko: "타악과 현악이 어우러진 프롤로그로 KNK의 시네마틱 세계를 여는 곡.",
      ja: "打楽器とストリングスが溶け合い、KNKのシネマティックな世界を開く序章。",
    },
    lyrics: { ko: [] },
  },
  "song-back-again": {
    id: "song-back-again",
    title: "Back Again",
    videoUrl: "https://www.youtube.com/watch?v=xGiFj1On9Mk",
    videoPlatform: "youtube",
    album: "Awake",
    description: {
      zh: "出道作中的招牌舞曲，副歌爆炸力與刁鑽 Formation 讓人立刻記住 KNK 的存在感。",
      en: "The debut-era signature dance track with an explosive drop and sharp formations that stamped KNK’s presence.",
      ko: "데뷔 시절을 대표하는 댄스트랙으로, 폭발적인 드롭과 날카로운 포메이션이 KNK의 존재감을 각인시킨다.",
      ja: "デビュー期を象徴するダンストラック。爆発的なドロップと緻密なフォーメーションで存在感を刻んだ。",
    },
    lyrics: {
      ko: ["다시 한 번, 처음의 설렘으로 돌아가고 싶어", "멈춘 시계를 네게로 다시 돌려 놓을게"],
      en: [
        "Once again I rewind every second back to the first night we met.",
        "Even if time stopped, I'll drag the hands of the clock until you answer me.",
      ],
    },
  },
  "song-i-remember": {
    id: "song-i-remember",
    title: "I Remember",
    album: "Awake",
    videoUrl: "https://www.youtube.com/watch?v=WJwyLWSAtGc",
    videoPlatform: "youtube",
    description: {
      zh: "抒情搖滾搭配迴盪吉他，傳達想回到最初承諾的告白。",
      en: "A pop-rock ballad with echoing guitars about wanting to return to the very first promise.",
      ko: "잔향 가득한 기타와 함께 처음의 약속으로 돌아가고픈 마음을 담은 팝록 발라드.",
      ja: "残響するギターで初めの約束へ戻りたい想いを綴るポップロックバラード。",
    },
    lyrics: { ko: [] },
  },
  "song-day-n-night": {
    id: "song-day-n-night",
    title: "Day N Night",
    album: "Awake",
    videoUrl: "https://www.youtube.com/watch?v=lEq67u3JL9s",
    videoPlatform: "youtube",
    description: {
      zh: "節奏藍調色彩濃厚，將日夜反覆的思念寫成切分節奏。",
      en: "A silky R&B track that turns day-and-night longing into syncopated grooves.",
      ko: "밤낮으로 이어지는 그리움을 싱코페이션 리듬으로 풀어낸 R&B 곡.",
      ja: "昼夜を問わぬ想いをシンコペーションで表現したR&Bナンバー。",
    },
    lyrics: { ko: [] },
  },
  "song-angel-heart": {
    id: "song-angel-heart",
    title: "Angel Heart",
    album: "Awake",
    videoUrl: "https://www.youtube.com/watch?v=W_TyKJLW75Q",
    videoPlatform: "youtube",
    description: {
      zh: "獻給粉絲的中速舞曲，用管弦 Pad 與合唱堆疊溫柔告白。",
      en: "A mid-tempo fan song layered with orchestral pads and choral hooks for a gentle confession.",
      ko: "팬들에게 바치는 미디엄 템포 곡으로 스트링 패드와 코러스를 겹겹이 쌓아 따뜻한 고백을 전한다.",
      ja: "ファンへの想いを込めたミドルテンポ曲。オーケストラパッドとコーラスで優しい告白を重ねる。",
    },
    lyrics: { ko: [] },
  },
  "song-rain": {
    id: "song-rain",
    title: "Rain",
    album: "Gravity, Completed",
    videoUrl: "https://www.youtube.com/watch?v=JFLjDM3X__Y",
    videoPlatform: "youtube",
    description: {
      zh: "以雨滴取代鼓點的 EDM Ballad，展現 KNK 特有的共鳴低音。",
      en: "An EDM ballad that swaps drum hits for raindrops and highlights KNK’s resonant low tones.",
      ko: "비 떨어지는 사운드를 리듬으로 사용해 KNK 특유의 묵직한 저음을 살린 EDM 발라드.",
      ja: "雨音を拍に置き換え、KNK特有の低音共鳴を際立たせるEDMバラード。",
    },
    lyrics: { ko: [] },
  },
  "song-think-about-you": {
    id: "song-think-about-you",
    title: "Think About You",
    album: "Gravity, Completed",
    videoUrl: "https://www.youtube.com/watch?v=ZF8Y0FYbLSk",
    videoPlatform: "youtube",
    description: {
      zh: "Trap 節奏搭配呢喃唱腔，是一首描寫暗戀的午夜告白。",
      en: "Whispery vocals over a trap groove craft a midnight confession about a secret crush.",
      ko: "트랩 리듬 위 속삭이는 보컬로 짝사랑의 자정을 그린 곡.",
      ja: "トラップビートと囁くボーカルで片想いの真夜中を描く一曲。",
    },
    lyrics: { ko: [] },
  },
  "song-love-you": {
    id: "song-love-you",
    title: "Love You",
    album: "Gravity, Completed",
    videoUrl: "https://www.youtube.com/watch?v=JFUlZQO_UF8",
    videoPlatform: "youtube",
    description: {
      zh: "柔和鋼琴與拍手聲堆疊，寫下「雖然笨拙卻想守護你」的訊息。",
      en: "Soft piano and handclaps underline a message of wanting to protect someone despite being clumsy.",
      ko: "부드러운 피아노와 핸드클랩 위에 서툴지만 지켜주고 싶은 마음을 담았다.",
      ja: "柔らかなピアノと手拍子に、不器用でも守りたいという想いをのせた。",
    },
    lyrics: { ko: [] },
  },
  "song-sun-moon-star": {
    id: "song-sun-moon-star",
    title: "Sun, Moon, Star",
    videoUrl: "https://www.youtube.com/watch?v=Uqw0eyvnFhE",
    videoPlatform: "youtube",
    album: "Gravity, Completed",
    description: {
      zh: "以宇宙意象比喻無法忘懷的戀人，合成器鋪陳與高音副歌是 KNK 垂直式和聲的代表作。",
      en: "An infinite-universe metaphor for unforgettable love, layered with synth pads and soaring harmonies.",
      ko: "끝없는 우주를 비유해 잊을 수 없는 사랑을 노래하며, 신스와 고음 하모니가 돋보인다.",
      ja: "宇宙のイメージで忘れられない恋人を描き、シンセと高音ハーモニーが代表的な一曲。",
    },
    lyrics: {
      ko: ["해와 달 그 사이에 남겨진 건 너의 기억뿐", "끝이 없는 우주라도 난 너를 찾아 헤맬 거야"],
      en: [
        "Only your memories are left between the sun and the moon.",
        "Even in an endless universe I wander until your light finds me again.",
      ],
    },
  },
  "song-good-night": {
    id: "song-good-night",
    title: "Good Night",
    album: "Gravity, Completed",
    videoUrl: "https://www.youtube.com/watch?v=0VxqVInUNB4",
    videoPlatform: "youtube",
    description: {
      zh: "以原聲吉他搭配弦樂，像寫給粉絲的晚安詩，收束整張 EP。",
      en: "Acoustic guitar and strings form a lullaby-like goodnight letter to fans that closes the EP.",
      ko: "어쿠스틱 기타와 스트링으로 팬에게 보내는 굿나잇 편지를 닮은 곡으로 EP를 마무리한다.",
      ja: "アコギとストリングスでファンに贈るおやすみの手紙のようにEPを締めくくる。",
    },
    lyrics: { ko: [] },
  },
  "song-ride": {
    id: "song-ride",
    title: "Ride",
    album: "KNK Airline",
    videoUrl: "https://www.youtube.com/watch?v=xepulPjW8yU",
    videoPlatform: "youtube",
    description: {
      zh: "主打歌以復古合成器與滑順貝斯描繪夜間兜風。",
      en: "The title track blends retro synths and slick bass to paint a late-night drive.",
      ko: "레트로 신스와 매끄러운 베이스로 밤 드라이브를 그린 타이틀곡.",
      ja: "レトロシンセと滑らかなベースで夜のドライブを描くタイトル曲。",
    },
    lyrics: { ko: [] },
  },
  "song-what-do-you-think": {
    id: "song-what-do-you-think",
    title: "What Do You Think?",
    album: "KNK Airline",
    videoUrl: "https://www.youtube.com/watch?v=7aL1PBnp8Fw",
    videoPlatform: "youtube",
    description: {
      zh: "以輕快節奏與話語式唱腔回應「你覺得我們怎麼樣？」的挑戰。",
      en: "A bright rhythm and talk-like delivery answer the question “What do you think about us?” with swagger.",
      ko: "경쾌한 리듬과 말하듯한 보컬로 “우리에 대해 어떻게 생각해?”라는 질문에 여유롭게 답한다.",
      ja: "軽快なリズムと語り口調のボーカルで「僕たちをどう思う？」という問いに余裕で応える。",
    },
    lyrics: { ko: [] },
  },
  "song-highway": {
    id: "song-highway",
    title: "Highway",
    album: "KNK Airline",
    videoUrl: "https://www.youtube.com/watch?v=NRKNRl-QaVA",
    videoPlatform: "youtube",
    description: {
      zh: "電吉他與合成器雙線推進，像高速公路上疾馳的霓虹。",
      en: "Electric guitars and synths run in parallel like neon lights racing down a highway.",
      ko: "일렉 기타와 신스가 이중으로 달리며 고속도로의 네온 질주를 그린다.",
      ja: "エレキギターとシンセが二重に走り、ハイウェイを駆けるネオンを描写。",
    },
    lyrics: { ko: [] },
  },
  "song-understand": {
    id: "song-understand",
    title: "Understand",
    album: "KNK Airline",
    videoUrl: "https://www.youtube.com/watch?v=8xCxo6yTk3o",
    videoPlatform: "youtube",
    description: {
      zh: "以節奏琴鍵與合唱回應「請理解我的笨拙」，情緒逐漸累積。",
      en: "Rhythmic keys and layered vocals plead “please understand my clumsy heart” as the emotion builds.",
      ko: "리드미컬한 키와 코러스가 “어설픈 나를 이해해줘”라는 마음을 점차 고조시킨다.",
      ja: "リズミカルな鍵盤と重なるコーラスで「不器用な僕を分かって」と感情を積み上げる。",
    },
    lyrics: { ko: [] },
  },
  "song-ground": {
    id: "song-ground",
    title: "Ground",
    album: "KNK Airline",
    videoUrl: "https://www.youtube.com/watch?v=I2_NC900qYM",
    videoPlatform: "youtube",
    description: {
      zh: "以低音鼓和厚重合唱收束航線，宣告重新站穩於地面。",
      en: "Low drums and weighty chants close the flight theme by declaring they are grounded again.",
      ko: "낮은 드럼과 묵직한 코러스가 비행 콘셉트를 마무리하며 다시 땅을 밟겠다는 메시지를 전한다.",
      ja: "低音ドラムと重いコーラスでフライトコンセプトを締め、再び地面に立つ決意を示す。",
    },
    lyrics: { ko: [] },
  },
  "song-lonely-night": {
    id: "song-lonely-night",
    title: "Lonely Night",
    videoUrl: "https://www.youtube.com/watch?v=bBP-Jkqfkvs",
    videoPlatform: "youtube",
    album: "Lonely Night",
    description: {
      zh: "KNK 轉入 220 Entertainment 後的第一首自作曲，將空無一人的夜街聲響與心跳對比。",
      en: "Their first self-written single after joining 220 Entertainment, contrasting empty night streets with pounding heartbeats.",
      ko: "220엔터테인먼트 합류 후 발표한 자작곡으로, 텅 빈 밤거리의 소리와 심장을 대비시킨다.",
      ja: "220 Entertainment移籍後に発表した初の自作曲。誰もいない夜の街と鼓動を対比させる。",
    },
    lyrics: {
      ko: ["조용한 새벽에 혼자 걷는 이 길 끝에서", "너의 이름만 입안에 맴돌다 사라져"],
      en: [
        "On this quiet dawn road I walk alone until it disappears.",
        "Only your name circles inside my mouth before it fades away.",
      ],
    },
  },
  "song-day-by-day": {
    id: "song-day-by-day",
    title: "Day by Day",
    album: "Lonely Night",
    videoUrl: "https://www.youtube.com/watch?v=Y61bhBSxQwQ",
    videoPlatform: "youtube",
    description: {
      zh: "收錄曲以搖擺鼓點與乾淨吉他描寫日常堆疊的寂寞。",
      en: "A B-side that uses swaying drums and clean guitars to portray loneliness piling up each day.",
      ko: "스윙감 있는 드럼과 담백한 기타로 하루하루 쌓이는 외로움을 노래한 수록곡.",
      ja: "スウィングするドラムと澄んだギターで日々積もる寂しさを描く収録曲。",
    },
    lyrics: { ko: [] },
  },
  "song-sunset": {
    id: "song-sunset",
    title: "Sunset",
    videoUrl: "https://www.youtube.com/watch?v=QwLBRSqWVVk",
    videoPlatform: "youtube",
    album: "KNK S/S Collection",
    description: {
      zh: "由成員主導的都會節奏歌曲，將日落前的橘紅天空寫成復古合成器與 City Pop 氛圍。",
      en: "Member-led production with a city-pop mood that paints the orange sky before sunset in retro synths.",
      ko: "멤버들이 주도한 시티팝 무드의 곡으로, 해 질 녘의 주황빛 하늘을 레트로 신스로 담아냈다.",
      ja: "メンバー主導の都会的なリズムで、夕暮れ前のオレンジ色の空をレトロシンセとシティポップ感で描く。",
    },
    lyrics: {
      ko: ["저물어가는 노을 속에 우리 추억이 번져가", "마지막 한 줄기 빛도 너로 물들어 가는데"],
      en: [
        "Our memories bleed into the fading sunset.",
        "Even the final streak of light is tinted with your name.",
      ],
    },
  },
  "song-we-are-the-night": {
    id: "song-we-are-the-night",
    title: "We Are The Night",
    album: "KNK S/S Collection",
    videoUrl: "https://www.youtube.com/watch?v=lcFpqfv1Mng",
    videoPlatform: "youtube",
    description: {
      zh: "帶有 City Pop 律動的副歌，像夜色裡互相照亮的宣言。",
      en: "A city-pop groove chorus that feels like a declaration to light each other up in the night.",
      ko: "시티팝 그루브의 후렴으로 밤 속 서로를 비추겠다는 선언을 들려준다.",
      ja: "シティポップのグルーヴを持つサビで、夜に互いを照らす宣言を放つ。",
    },
    lyrics: { ko: [] },
  },
};

interface SongProperties {
  Title: NotionTitleProperty;
  Album?: NotionSelectProperty;
  Description?: NotionRichTextProperty;
  "Description (zh)"?: NotionRichTextProperty;
  "Description (ko)"?: NotionRichTextProperty;
  "Description (ja)"?: NotionRichTextProperty;
  "Description (en)"?: NotionRichTextProperty;
  "Lyrics (ko)"?: NotionRichTextProperty;
  "Lyrics (zh)"?: NotionRichTextProperty;
  "Lyrics (ja)"?: NotionRichTextProperty;
  "Lyrics (en)"?: NotionRichTextProperty;
  "Lyrics (ro)"?: NotionRichTextProperty;
  Video?: NotionUrlProperty;
}

function mapLyricsValue(property?: NotionRichTextProperty): string[] | undefined {
  const value = getRichTextValue(property);
  return value ? value.split("\n").map((line) => line.trim()).filter(Boolean) : undefined;
}

function getLocalizedDescription(properties: SongProperties, locale: AppLocale) {
  const key = `Description (${locale})` as SongDescriptionKey;
  const defaultKey = `Description (${defaultLocale})` as SongDescriptionKey;
  return (
    getRichTextValue(properties[key]) ??
    getRichTextValue(properties[defaultKey]) ??
    getRichTextValue(properties.Description) ??
    undefined
  );
}

function mapSong(page: NotionPage<SongProperties>, locale: AppLocale): SongDetail {
  const { properties } = page;
  const videoUrl = sanitizeUrl(properties.Video?.url ?? undefined);

  const lyrics: LyricsContent = {
    ko: mapLyricsValue(properties["Lyrics (ko)"]) ?? [],
    zh: mapLyricsValue(properties["Lyrics (zh)"]),
    ja: mapLyricsValue(properties["Lyrics (ja)"]),
    en: mapLyricsValue(properties["Lyrics (en)"]),
    romanization: mapLyricsValue(properties["Lyrics (ro)"]),
  };

  return {
    id: page.id,
    title: getTitleValue(properties.Title),
    album: properties.Album?.select?.name,
    description: getLocalizedDescription(properties, locale),
    videoUrl,
    videoPlatform: videoUrl?.includes("youtube") ? "youtube" : "spotify",
    lyrics,
  };
}

function buildFallbackSong(id: string, locale: AppLocale): SongDetail | null {
  const song = fallbackSongs[id];
  if (!song) {
    return null;
  }

  return {
    ...song,
    description: song.description ? getLocalizedValue(song.description, locale) : undefined,
  };
}

export async function fetchSongById(id: string, locale: AppLocale = defaultLocale): Promise<SongDetail | null> {
  const databaseId = process.env.NOTION_SONGS_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    return buildFallbackSong(id, locale);
  }

  try {
    const response = await notionClient.queryDatabase<NotionQueryResponse<SongProperties>>({
      database_id: databaseId,
      filter: {
        property: "Slug",
        rich_text: { equals: id },
      },
    });

    if (response.results.length === 0) {
      return buildFallbackSong(id, locale);
    }

    return mapSong(response.results[0], locale);
  } catch (error) {
    console.error("Failed to fetch song", error);
    return buildFallbackSong(id, locale);
  }
}
