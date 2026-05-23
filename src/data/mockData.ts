import type {
  Song,
  Artist,
  Rhythm,
  Genre,
  ChordDiagram,
  Sheet,
  Playlist,
} from "../types";

export const RHYTHMS: Rhythm[] = [
  { id: "ballad", name: "Ballad", songCount: 23916 },
  { id: "blues", name: "Blues", songCount: 3869 },
  { id: "disco", name: "Disco", songCount: 1892 },
  { id: "slowrock", name: "Slow Rock", songCount: 1773 },
  { id: "slow", name: "Slow", songCount: 1722 },
  { id: "bollero", name: "Bollero", songCount: 1466 },
  { id: "valse", name: "Valse", songCount: 945 },
  { id: "fox", name: "Fox", songCount: 768 },
  { id: "pop", name: "Pop", songCount: 749 },
  { id: "rock", name: "Rock", songCount: 632 },
  { id: "rnb", name: "R&B", songCount: 521 },
  { id: "rap", name: "Rap / Hip-Hop", songCount: 408 },
];

export const GENRES: Genre[] = [
  { id: "viet", name: "Nhạc Việt", songCount: 45200 },
  { id: "us-uk", name: "US-UK", songCount: 12300 },
  { id: "kpop", name: "K-Pop", songCount: 5600 },
  { id: "nhac-tre", name: "Nhạc Trẻ", songCount: 8900 },
  { id: "nhac-vang", name: "Nhạc Vàng", songCount: 6200 },
  { id: "tinh-ca", name: "Tình Ca", songCount: 3400 },
  { id: "thieng-lieng", name: "Thiêng Liêng", songCount: 1200 },
  { id: "thieu-nhi", name: "Thiếu Nhi", songCount: 980 },
];

export const ARTISTS: Artist[] = [
  { id: 1, name: "Sơn Tùng M-TP", slug: "son-tung-m-tp", songCount: 48 },
  { id: 2, name: "Hà Anh Tuấn", slug: "ha-anh-tuan", songCount: 62 },
  { id: 3, name: "Mỹ Tâm", slug: "my-tam", songCount: 75 },
  { id: 4, name: "Đen Vâu", slug: "den-vau", songCount: 34 },
  { id: 5, name: "Trịnh Công Sơn", slug: "trinh-cong-son", songCount: 120 },
  { id: 6, name: "Taylor Swift", slug: "taylor-swift", songCount: 95 },
  { id: 7, name: "Ed Sheeran", slug: "ed-sheeran", songCount: 67 },
  { id: 8, name: "BTS", slug: "bts", songCount: 88 },
  { id: 9, name: "Vũ", slug: "vu", songCount: 41 },
  { id: 10, name: "Hồng Nhung", slug: "hong-nhung", songCount: 58 },
];

export const SONGS: Song[] = [
  {
    id: 1,
    title: "Nơi Này Có Anh",
    slug: "noi-nay-co-anh",
    artist: ARTISTS[0],
    contributors: ["minhbk65"],
    rhythm: RHYTHMS[0],
    genre: GENRES[0],
    tone: "Am",
    capo: 0,
    chords: ["Am", "C", "C7", "Em", "F", "G"],
    content: `[Verse 1]
Em là [[F]] ai từ đâu bước [[G]] đến nơi đây dịu [[Am]] dàng chưa nói một [[C]] câu
Em là [[F]] ai tựa như ánh [[G]] nắng ban mai ngọt [[C]] ngào trong sương
Ngắm em [[F]] thật [[G]] lâu con [[Am]] tim anh xao xuyến
Chỉ muốn [[F]] bên em mãi [[G]] thôi

[Pre-Chorus]
Và anh [[Am]] biết [[G]] rằng em là [[F]] người con gái
Mà anh [[C]] đã tìm kiếm [[G]] bấy lâu
Nụ cười [[Am]] của em [[G]] làm anh [[F]] quên đi tất cả
Chỉ còn [[C]] lại tình yêu [[G]] mà thôi

[Chorus]
Nơi này có [[Am]] anh luôn ở [[C]] đây bên em
Dù mưa rơi [[F]] hay nắng về [[G]] anh vẫn bên em
Nơi này có [[Am]] anh luôn [[C]] dành cho em
Trọn vẹn [[F]] tình yêu này [[G]] mãi mãi

[Verse 2]
Em là [[F]] điều kỳ diệu [[G]] nhất trong cuộc đời [[Am]] anh
Em là [[F]] ánh sao sáng [[G]] trong bầu trời đêm [[C]] tối
Mỗi ngày [[F]] qua đi [[G]] cùng [[Am]] em thật tuyệt
Anh chỉ [[F]] mong em biết [[G]] rằng

[Bridge]
Anh sẽ [[Am]] luôn ở đây [[F]] bên cạnh em
Che chở [[C]] và yêu [[G]] thương em
Dù bao [[Am]] nhiêu khó khăn [[F]] phía trước
Anh và [[C]] em cùng [[G]] vượt qua`,
    views: 45230,
    likes: 3821,
    createdAt: "2017-02-25",
    youtubeId: "dQw4w9WgXcQ",
    tags: ["vpop", "tình yêu", "guitar"],
  },
  {
    id: 2,
    title: "Lạ Lùng",
    slug: "la-lung",
    artist: ARTISTS[8],
    contributors: ["oneduck"],
    rhythm: RHYTHMS[1],
    genre: GENRES[0],
    tone: "C",
    capo: 0,
    chords: ["A7", "Am", "C", "C7", "Dm7", "E", "E7", "Em", "F", "G", "G/B"],
    content: `[Verse 1]
Kìa màn [[C]] đêm hiu hắt [[G/B]], mang tên [[A7]] em quay về trong ký
[[Dm7]] ức, của [[G]] anh qua [[C]] thời gian
Chiều lặng [[C]] im nghe [[G/B]] gió đung đưa [[Am]] lời ca
Đã từng [[Dm7]] rất gần nhau nhưng [[G]] sao lại quá [[C]] xa

[Pre-Chorus]
Mà sao [[F]] lạ lùng [[C]] quá
Khi [[Em]] yêu nhau [[Am]] rồi chia xa
Lòng [[Dm7]] vẫn nhớ [[G]] nhớ mãi

[Chorus]
Lạ [[C]] lùng thay [[G]] sao vẫn nhớ [[Am]] em
Dù đã [[F]] bao năm qua [[G]] đi
Lạ [[C]] lùng thay [[G]] tim vẫn gọi [[Am]] tên
Một người [[F]] đã xa [[G]] lắm rồi

[Verse 2]
Đêm nay [[C]] nghe bài ca [[G/B]] cũ ấy [[A7]] lòng lại bâng
[[Dm7]] khuâng, nhớ [[G]] về [[C]] ngày xưa
Tiếng cười [[C]] của em [[G/B]] vang trong [[Am]] ký ức
Như là [[Dm7]] chưa bao giờ [[G]] chia tay [[C]] nhau`,
    views: 38900,
    likes: 2943,
    createdAt: "2017-08-30",
    tags: ["indie", "ballad", "blues"],
  },
  {
    id: 3,
    title: "Diễm Xưa",
    slug: "diem-xua",
    artist: { id: 5, name: "Trịnh Công Sơn", slug: "trinh-cong-son" },
    contributors: ["kabigon91"],
    rhythm: RHYTHMS[4],
    genre: GENRES[0],
    tone: "Am",
    capo: 0,
    chords: ["Am", "C", "Dm", "E7"],
    content: `[Verse 1]
Mưa vẫn [[Am]] mưa bay trên tầng [[E7]] tháp cổ
Dài tay [[Dm]] em mấy thuở [[E7]] mắt xanh xao
Nghe lá [[Am]] thu mưa reo mòn gót [[E7]] nhỏ
Đường dài hun [[C]] hút cho mắt thêm [[E7]] sâu

[Verse 2]
Mưa vẫn [[Am]] hay mưa trên hàng [[E7]] lá nhỏ
Buổi chiều [[Dm]] ngồi ngóng [[E7]] những chuyến mưa qua
Trên bước [[Am]] chân em âm thầm [[E7]] lá đổ
Chợt hồn xanh [[C]] buốt cho mình xót [[E7]] xa

[Chorus]
Chiều nay [[Am]] còn mưa sao em [[E7]] không lại
Nhỡ mai trong [[Dm]] cõi vô thường [[E7]]
Còn [[Am]] mưa xuống đời thường [[E7]]
Ôi thiên [[Dm]] thu quá [[E7]] xá từ [[Am]] đây

[Outro]
Dài tay [[Am]] em mấy thuở mắt [[E7]] xanh xao
Nghe lá [[Dm]] thu mưa reo mòn gót [[E7]] nhỏ
Xin hãy [[Am]] cho mưa qua miền [[E7]] đất rộng
Để người [[C]] phiêu lãng quên mình lãng [[Am]] du`,
    views: 52100,
    likes: 4120,
    createdAt: "2018-11-01",
    tags: ["nhạc vàng", "trịnh công sơn", "classic"],
  },
  {
    id: 4,
    title: "Nàng Thơ",
    slug: "nang-tho",
    artist: { id: 11, name: "Hoàng Dũng", slug: "hoang-dung" },
    contributors: ["letungduong1604"],
    rhythm: RHYTHMS[0],
    genre: GENRES[0],
    tone: "C",
    capo: 0,
    chords: [
      "A",
      "A#",
      "Am",
      "Am7",
      "Bm7",
      "C",
      "C7",
      "Cm",
      "D",
      "Dm",
      "Dm7",
      "E7",
      "Em",
      "Em7",
      "F",
      "F#m7",
      "G",
      "Gm7",
    ],
    content: `[Verse 1]
[[C]] Em, ngày em đánh [[Em7]] rơi nụ cười vào [[Am7]] anh
Anh [[Gm7]] biết [[C7]] không, anh còn [[F]] giữ nguyên [[Dm]]
[[C]] Thầm, những điều em [[Em7]] nói thêm vào [[Am7]] tim
Cho dù [[Gm7]] có [[C7]] nghĩ sau [[F]] này em sẽ [[Dm]] chờ
Và vô tư cho đi hết [[G]] những ngây thơ

[Chorus]
[[C]] Như ngọn gió [[G]] đi qua làm [[Am]] lay lá cành
Như vì [[F]] sao về đêm chiếu [[C]] sáng vô danh
[[C]] Như loài hoa [[G]] rừng nở trong [[Am]] vắng không ai
Như giòng [[F]] sông xa nguồn vẫn [[G]] mãi chảy hoài

Em là [[C]] nàng thơ [[G]] của anh

[Verse 2]
[[C]] Anh, vẫn nghe em [[Em7]] hát ru vào [[Am7]] đêm
Lời ca [[Gm7]] khuây [[C7]] xua nỗi [[F]] buồn trong [[Dm]] anh
[[C]] Mây, vẫn trôi về [[Em7]] đâu đó theo [[Am7]] em
Dù trời [[Gm7]] đã [[C7]] thay màu [[F]] anh vẫn ở [[Dm]] lại
Giữ lại những tháng ngày [[G]] không phai

[Bridge]
[[F]] Dù bao nhiêu năm [[C]] tháng qua đi
[[Dm]] Anh vẫn nhớ [[G]] em như thuở ban [[C]] đầu
[[F]] Dù thế giới [[C]] này có đổi thay
[[Dm]] Em vẫn mãi [[G]] là nàng thơ của [[C]] anh`,
    views: 41800,
    likes: 3650,
    createdAt: "2020-08-03",
    tags: ["indie", "vpop", "romantic"],
  },
  {
    id: 5,
    title: "Dù Có Cách Xa",
    slug: "du-co-cach-xa",
    artist: { id: 12, name: "Đinh Mạnh Ninh", slug: "dinh-manh-ninh" },
    contributors: ["quanchidan1999"],
    rhythm: RHYTHMS[4],
    genre: GENRES[0],
    tone: "G",
    capo: 0,
    chords: ["C", "D", "Em", "G"],
    content: `[Verse 1]
Ngày hôm [[G]] qua em chợt mang nắng tới
Chợt làm ngẩn ngơ đắm [[Em]] say
Anh chiếc hôn bối rối
Chợt làm nên câu [[C]] ca, chợt gọi mùa xuân qua
Đường dài tay trong [[D]] tay anh nghe mùa xuân ôi đắm say

[Verse 2]
Và rồi em nơi thật [[G]] xa
Anh mang tình yêu không phôi pha
Mỉm cười khi bỗng nhớ [[Em]] em
Anh nâng câu hát
Hát yêu em thật [[C]] nhiều, nhớ môi em thật nhiều
Muốn theo mây và [[D]] gió đến bên em

[Chorus]
Dù có [[G]] cách xa [[D]] đôi ta yêu nhau vẫn còn
Dù có [[Em]] muôn trùng [[C]] xa xôi ngăn cách ta lại
Dù có [[G]] cách xa [[D]] anh vẫn luôn nhớ về em
Dù có [[Em]] cách xa [[C]] anh vẫn yêu [[D]] em thật nhiều

[Bridge]
[[C]] Nhớ mắt em nhìn [[G]] anh yêu thương
[[C]] Nhớ đôi tay em [[D]] tựa vào vai
[[C]] Dù đường ta đi [[G]] muôn lối
[[Em]] Tình ta mãi [[D]] không phai`,
    views: 35600,
    likes: 2890,
    createdAt: "2017-04-05",
    tags: ["ballad", "slow", "romantic"],
  },
  {
    id: 6,
    title: "Shape of You",
    slug: "shape-of-you",
    artist: ARTISTS[6],
    contributors: ["musiclover"],
    rhythm: RHYTHMS[8],
    genre: GENRES[1],
    tone: "C#m",
    capo: 4,
    chords: ["Am", "C", "F", "G"],
    content: `[Verse 1]
The [[Am]] club isn't the best place to find a lover
So the [[C]] bar is where I go
Me and my [[F]] friends at the table doing shots
Drinking [[G]] fast and then we talk slow

[[Am]] Come over and start up a conversation with just me
And [[C]] trust me I'll give it a chance now
Take my [[F]] hand, stop, put Van the Man on the jukebox
And then we [[G]] start to dance, and now I'm singing like

[Pre-Chorus]
[[Am]] Girl, you know I want your love
Your [[C]] love was handmade for somebody like me
Come on now, [[F]] follow my lead
I may be [[G]] crazy, don't mind me

[Chorus]
Say, boy, let's not talk too much
[[Am]] Grab on my waist and put that body on me
Come on now, [[C]] follow my lead
Come, come on now, [[F]] follow my lead

I'm in [[Am]] love with the shape of you
We push and [[C]] pull like a magnet do
Although my [[F]] heart is falling too
I'm in love with your [[G]] body
[[Am]] Last night you were in my room
And now my [[C]] bedsheets smell like you
Every day dis[[F]]covering something brand new
I'm in love with your [[G]] body`,
    views: 28900,
    likes: 2341,
    createdAt: "2017-01-06",
    youtubeId: "dQw4w9WgXcQ",
    tags: ["pop", "english", "ed sheeran"],
  },
  {
    id: 7,
    title: "Bốn Chữ Lắm",
    slug: "bon-chu-lam",
    artist: { id: 13, name: "Trúc Nhân", slug: "truc-nhan" },
    contributors: ["user123"],
    rhythm: RHYTHMS[0],
    genre: GENRES[0],
    tone: "D",
    capo: 0,
    chords: ["Am", "D", "Em", "G"],
    content: `[Verse 1]
Nhớ về [[D]] Tình là [[Am]] có không khi nào
Tay cầm tay, thương là thương [[G]] Sao chờ mong ngày mai ai [[D]] biết ra sao
Người có [[Am]] đi

[Chorus]
Yêu [[D]] là yêu thôi [[Am]] đừng hỏi tại sao
Thương [[Em]] là thương thật [[G]] lòng
Một ngày [[D]] bên nhau [[Am]] là đã quá nhiều
Bốn chữ [[Em]] lắm [[G]] anh yêu em

[Verse 2]
Còn đây [[D]] tiếng nói [[Am]] nhẹ nhàng như gió
Còn đây [[Em]] hơi thở [[G]] ấm áp bên vai
Mỗi ngày [[D]] trôi qua [[Am]] cùng nhau thật vui
Tình yêu [[Em]] này [[G]] mãi không phai`,
    views: 22400,
    likes: 1876,
    createdAt: "2019-06-15",
    tags: ["vpop", "ballad", "love"],
  },
  {
    id: 8,
    title: "50 Năm Về Sau",
    slug: "50-nam-ve-sau",
    artist: { id: 14, name: "Đặng Thanh Tuyền", slug: "dang-thanh-tuyen" },
    contributors: ["dungnguyen27041996"],
    rhythm: RHYTHMS[0],
    genre: GENRES[0],
    tone: "C",
    capo: 0,
    chords: ["Am", "C", "Dm", "E7", "Em", "F", "G"],
    content: `[Verse 1]
May mắn cả [[C]] đời này của tôi là đã [[Em]] gặp đúng được người
Lúc em [[F]] vừa hay yêu tôi, và [[G]] tôi cũng yêu người
Những tháng ngày [[E7]] chênh vênh khó khăn chẳng còn ôm [[Am]] cô đơn một mình
Bên cạnh [[F]] nhau trọn vẹn xây nên [[G]] gia đình

[Chorus]
Diễm phúc cả [[C]] đời này của tôi là được [[Em]] chung lối cùng người
Khi 50 [[F]] năm về sau tóc đã [[G]] bạc phơ rồi
Tôi vẫn [[Am]] muốn nói yêu em, vẫn [[F]] muốn cầm tay em
Và mãi [[C]] bên em đến cuối [[G]] cuộc đời này`,
    views: 19800,
    likes: 1590,
    createdAt: "2022-10-17",
    tags: ["ballad", "romantic", "classic"],
  },
];

export const TRENDING_SONGS = SONGS.slice(0, 6);
export const NEW_SONGS = [...SONGS].reverse().slice(0, 6);

export const PLAYLISTS: Playlist[] = [
  {
    id: 1,
    title: "Nhạc Buổi Sáng",
    description: "Những bài hát nhẹ nhàng cho buổi sáng",
    songs: [1, 2, 5, 7],
    coverSong: SONGS[0],
    createdBy: "admin",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    title: "Guitar Acousticr",
    description: "Các bài hát phù hợp để tập guitar acoustic",
    songs: [3, 4, 5, 8],
    coverSong: SONGS[3],
    createdBy: "admin",
    createdAt: "2024-02-20",
  },
  {
    id: 3,
    title: "Nhạc Trịnh Bất Hủ",
    description: "Những bài hát bất hủ của Trịnh Công Sơn",
    songs: [3],
    coverSong: SONGS[2],
    createdBy: "kabigon91",
    createdAt: "2024-03-10",
  },
];

// Guitar chord diagrams data
export const CHORD_DIAGRAMS: Record<string, ChordDiagram> = {
  Am: {
    name: "Am",
    frets: [0, 0, 2, 2, 1, 0],
    fingers: [0, 0, 2, 3, 1, 0],
    baseFret: 1,
  },
  A: {
    name: "A",
    frets: [-1, 0, 2, 2, 2, 0],
    fingers: [0, 0, 1, 2, 3, 0],
    baseFret: 1,
  },
  A7: {
    name: "A7",
    frets: [-1, 0, 2, 0, 2, 0],
    fingers: [0, 0, 2, 0, 1, 0],
    baseFret: 1,
  },
  C: {
    name: "C",
    frets: [-1, 3, 2, 0, 1, 0],
    fingers: [0, 3, 2, 0, 1, 0],
    baseFret: 1,
  },
  C7: {
    name: "C7",
    frets: [-1, 3, 2, 3, 1, 0],
    fingers: [0, 3, 2, 4, 1, 0],
    baseFret: 1,
  },
  D: {
    name: "D",
    frets: [-1, -1, 0, 2, 3, 2],
    fingers: [0, 0, 0, 1, 3, 2],
    baseFret: 1,
  },
  Dm: {
    name: "Dm",
    frets: [-1, -1, 0, 2, 3, 1],
    fingers: [0, 0, 0, 2, 3, 1],
    baseFret: 1,
  },
  Dm7: {
    name: "Dm7",
    frets: [-1, -1, 0, 2, 1, 1],
    fingers: [0, 0, 0, 2, 1, 1],
    baseFret: 1,
  },
  E: {
    name: "E",
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
    baseFret: 1,
  },
  Em: {
    name: "Em",
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
    baseFret: 1,
  },
  E7: {
    name: "E7",
    frets: [0, 2, 0, 1, 0, 0],
    fingers: [0, 2, 0, 1, 0, 0],
    baseFret: 1,
  },
  F: {
    name: "F",
    frets: [1, 1, 2, 3, 3, 1],
    fingers: [1, 1, 2, 3, 4, 1],
    baseFret: 1,
    barres: [{ fromString: 6, toString: 1, fret: 1 }],
  },
  G: {
    name: "G",
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
    baseFret: 1,
  },
  G7: {
    name: "G7",
    frets: [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, 0, 0, 0, 1],
    baseFret: 1,
  },
  Bm: {
    name: "Bm",
    frets: [-1, 2, 4, 4, 3, 2],
    fingers: [0, 1, 3, 4, 2, 1],
    baseFret: 1,
    barres: [{ fromString: 5, toString: 1, fret: 2 }],
  },
  B7: {
    name: "B7",
    frets: [-1, 2, 1, 2, 0, 2],
    fingers: [0, 2, 1, 3, 0, 4],
    baseFret: 1,
  },
};

export const ALL_CHORDS = Object.keys(CHORD_DIAGRAMS);

export const SHEETS: Sheet[] = SONGS.map((song, i) => {
  const diffList = ["beginner", "intermediate", "advanced"] as const;
  const instrMap: Record<number, string[]> = {
    1: ["guitar", "ukulele"],
    2: ["guitar"],
    3: ["guitar", "piano"],
    4: ["guitar", "piano"],
    5: ["guitar"],
    6: ["guitar", "ukulele"],
    7: ["guitar"],
    8: ["guitar", "piano"],
  };
  return {
    id: song.id,
    songId: song.id,
    title: song.title,
    slug: song.slug,
    artist: song.artist,
    tone: song.tone,
    capo: song.capo ?? 0,
    rhythm: song.rhythm,
    genre: song.genre,
    instruments: instrMap[song.id] ?? ["guitar"],
    difficulty: diffList[i % 3],
    pages: Math.ceil(song.content.split("\n").length / 20),
    downloads: Math.floor(song.views * 0.15),
    likes: song.likes,
    views: song.views,
    createdAt: song.createdAt,
    contributors: song.contributors,
    chords: song.chords,
    content: song.content,
    tags: song.tags,
  };
});
