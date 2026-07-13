const KANAANITH_SIGNS = {
  Aleph: "𐤀", Beth: "𐤁", Gimel: "𐤂", Daleth: "𐤃", He: "𐤄", Waw: "𐤅",
  Zayin: "𐤆", Heth: "𐤇", Teth: "𐤈", Yodh: "𐤉", Kaph: "𐤊", Lamedh: "𐤋",
  Mem: "𐤌", Nun: "𐤍", Samekh: "𐤎", Ayin: "𐤏", Pe: "𐤐", Sade: "𐤑",
  Qoph: "𐤒", Resh: "𐤓", Shin: "𐤔", Taw: "𐤕"
};

const KANAANITH_DIGRAPHS = { SH: "Shin", HH: "Heth", TT: "Teth", SS: "Sade" };
const KANAANITH_LATIN = {
  A:"Aleph", B:"Beth", C:"Heth", D:"Daleth", E:"Ayin", F:"Pe", G:"Gimel",
  H:"He", I:"Yodh", J:"Yodh", K:"Kaph", L:"Lamedh", M:"Mem", N:"Nun",
  O:"Ayin", P:"Pe", Q:"Qoph", R:"Resh", S:"Samekh", T:"Taw", U:"Waw",
  V:"Waw", W:"Waw", X:"Sade", Y:"Yodh", Z:"Zayin"
};

function toKanaanith(value) {
  const text = value.toUpperCase();
  let result = "";
  for (let i = 0; i < text.length;) {
    const pair = text.slice(i, i + 2);
    if (KANAANITH_DIGRAPHS[pair]) {
      result += KANAANITH_SIGNS[KANAANITH_DIGRAPHS[pair]];
      i += 2;
    } else if (KANAANITH_LATIN[text[i]]) {
      result += KANAANITH_SIGNS[KANAANITH_LATIN[text[i]]];
      i += 1;
    } else {
      result += text[i];
      i += 1;
    }
  }
  return result;
}
