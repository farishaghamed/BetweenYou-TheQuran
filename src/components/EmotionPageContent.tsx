"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import type { Emotion } from "@/data/emotions";
import JournalSheet from "./JournalSheet";
import QuranOverlay from "./QuranOverlay";
import VerseAudioButton from "./VerseAudioButton";
import {
  resolveMishariRecitationId,
  fetchAyahAudioUrl,
} from "@/lib/recitationAudio";
import { useJournal } from "@/lib/journal/useJournal";

type AudioState = "idle" | "loading" | "playing" | "paused" | "error";

interface VerseReflectionData {
  verseKey: string;
  arabic: string;
  english: string;
  surah: string;
  reflection: string[];
}

const emotionVerseMap: Record<string, VerseReflectionData[]> = {
  grieving: [
    {
      verseKey: "12:86",
      arabic: "قَالَ إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ وَأَعْلَمُ مِنَ اللَّهِ مَا لَا تَعْلَمُونَ",
      english: "He replied, \u2018I complain of my anguish and sorrow only to Allah, and I know from Allah what you do not know.\u2019",
      surah: "Surah Yusuf (12:86)",
      reflection: [
        "Ya\u2019qub wept for years. His eyes dimmed from it. And still, he was never told to stop.",
        "When those around him grew tired of his grief, he didn\u2019t argue \u2014 he just said: I take this to Allah. Not to you.",
        "That choice \u2014 to bring it to Allah rather than defend it \u2014 carries its own release. Your pain doesn\u2019t have to be explained or justified or gotten over. It just has to find the right place to go.",
      ],
    },
  ],
  "seeking-calm": [
    {
      verseKey: "8:10",
      arabic: "وَمَا جَعَلَهُ ٱللَّهُ إِلَّا بُشْرَىٰ وَلِتَطْمَئِنَّ بِهِۦ قُلُوبُكُمْ ۚ وَمَا ٱلنَّصْرُ إِلَّا مِنْ عِندِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ عَزِيزٌ حَكِيمٌ",
      english: "Allah made it only as good news, and so that your hearts would be assured by it. And victory is not except from Allah. Indeed, Allah is Exalted in Might and Wise.",
      surah: "Surah Al-Anfal (8:10)",
      reflection: [
        "The angels at Badr weren\u2019t sent to change the numbers. They were sent so that hearts could settle. The verse holds that order deliberately \u2014 the calm came before the outcome.",
        "The heart was the priority, not the battlefield. Calm, here, was the first provision.",
      ],
    },
    {
      verseKey: "48:4",
      arabic: "هُوَ ٱلَّذِىٓ أَنزَلَ ٱلسَّكِينَةَ فِى قُلُوبِ ٱلْمُؤْمِنِينَ لِيَزْدَادُوٓا۟ إِيمَـٰنًا مَّعَ إِيمَـٰنِهِمْ ۗ وَلِلَّهِ جُنُودُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ ۚ وَكَانَ ٱللَّهُ عَلِيمًا حَكِيمًا",
      english: "It is He who sent down tranquility into the hearts of the believers that they would increase in faith along with their faith. And to Allah belong the soldiers of the heavens and the earth, and ever is Allah Knowing and Wise.",
      surah: "Surah Al-Fath (48:4)",
      reflection: [
        "The sakina \u2014 the calm \u2014 was something sent, not something arrived at. It came from outside into the inside of them.",
        "It came not as an ending but as an opening: so their faith would grow. Calm here isn\u2019t the absence of something \u2014 it\u2019s the arrival of something.",
      ],
    },
    {
      verseKey: "20:14",
      arabic: "إِنَّنِىٓ أَنَا ٱللَّهُ لَآ إِلَـٰهَ إِلَّآ أَنَا۠ فَٱعْبُدْنِى وَأَقِمِ ٱلصَّلَوٰةَ لِذِكْرِىٓ",
      english: "Indeed, I am Allah. There is no deity except Me, so worship Me and establish prayer for My remembrance.",
      surah: "Surah Ta-Ha (20:14)",
      reflection: [
        "The first thing Musa was told after meeting his Lord was to pray \u2014 not as a rule, but for the sake of remembrance.",
        "The first antidote to being overwhelmed was to return your attention. Prayer, here, is the act of coming back \u2014 to the one name that holds everything else.",
      ],
    },
    {
      verseKey: "50:16",
      arabic: "وَلَقَدْ خَلَقْنَا ٱلْإِنسَـٰنَ وَنَعْلَمُ مَا تُوَسْوِسُ بِهِۦ نَفْسُهُۥ ۖ وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ ٱلْوَرِيدِ",
      english: "And We have already created man and know what his soul whispers to him, and We are closer to him than his jugular vein.",
      surah: "Surah Qaf (50:16)",
      reflection: [
        "What the soul whispers \u2014 not what you say, but what moves through you beneath speech \u2014 is already known.",
        "The closeness described here isn\u2019t surveillance. It\u2019s intimacy. You are not carrying something no one knows about. You were never alone in it.",
      ],
    },
    {
      verseKey: "2:248",
      arabic: "وَقَالَ لَهُمْ نَبِيُّهُمْ إِنَّ ءَايَةَ مُلْكِهِۦٓ أَن يَأْتِيَكُمُ ٱلتَّابُوتُ فِيهِ سَكِينَةٌ مِّن رَّبِّكُمْ وَبَقِيَّةٌ مِّمَّا تَرَكَ ءَالُ مُوسَىٰ وَءَالُ هَـٰرُونَ تَحْمِلُهُ ٱلْمَلَـٰٓئِكَةُ ۚ إِنَّ فِى ذَٰلِكَ لَـَٔايَةً لَّكُمْ إِن كُنتُم مُّؤْمِنِينَ",
      english: "And their prophet said to them, \u2018Indeed, a sign of his kingship is that the chest will come to you in which is assurance from your Lord and a remnant of what the family of Moses and the family of Aaron had left, carried by the angels. Indeed in that is a sign for you, if you are believers.\u2019",
      surah: "Surah Al-Baqarah (2:248)",
      reflection: [
        "The sakina inside the ark was described as being \u2018from your Lord\u2019 \u2014 not made, not found, not earned. Sent.",
        "The people needed a sign, and what arrived was tranquility. Peace itself was the confirmation that something true was present.",
      ],
    },
  ],
  "seeking-forgiveness": [
    {
      verseKey: "39:53",
      arabic: "۞ قُلْ يَـٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا ۚ إِنَّهُۥ هُوَ ٱلْغَفُورُ ٱلرَّحِيمُ",
      english: "Say, \u02bfO Prophet, that Allah says,\u02bf \u2018O My servants who have exceeded the limits against their souls! Do not lose hope in Allah\u2019s mercy, for Allah certainly forgives all sins. He is indeed the All-Forgiving, Most Merciful.\u2019",
      surah: "Surah Az-Zumar (39:53)",
      reflection: [
        "This verse is addressed to those who have gone far \u2014 not to those who are barely slipping. It\u2019s spoken directly to the ones who feel they\u2019ve done too much, gone too deep.",
        "And even to them, the response isn\u2019t \u201ctry harder\u201d or \u201cmake it up.\u201d It\u2019s: do not despair. The mercy here has no qualifier on size. All sins. Nothing withheld from that word.",
      ],
    },
    {
      verseKey: "25:70",
      arabic: "إِلَّا مَن تَابَ وَءَامَنَ وَعَمِلَ عَمَلًا صَـٰلِحًا فَأُو۟لَـٰٓئِكَ يُبَدِّلُ ٱللَّهُ سَيِّـَٔاتِهِمْ حَسَنَـٰتٍ ۗ وَكَانَ ٱللَّهُ غَفُورًا رَّحِيمًا",
      english: "As for those who repent, believe, and do good deeds, they are the ones whose evil deeds Allah will change into good deeds. For Allah is All-Forgiving, Most Merciful.",
      surah: "Surah Al-Furqan (25:70)",
      reflection: [
        "The verse doesn\u2019t say the record gets cleared and left blank. It says the bad is exchanged for good. Not erased \u2014 turned.",
        "The turning itself becomes part of the story. Not buried, not hidden \u2014 woven in.",
      ],
    },
    {
      verseKey: "66:8",
      arabic: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ تُوبُوٓا۟ إِلَى ٱللَّهِ تَوْبَةً نَّصُوحًا عَسَىٰ رَبُّكُمْ أَن يُكَفِّرَ عَنكُمْ سَيِّـَٔاتِكُمْ وَيُدْخِلَكُمْ جَنَّـٰتٍ تَجْرِى مِن تَحْتِهَا ٱلْأَنْهَـٰرُ يَوْمَ لَا يُخْزِى ٱللَّهُ ٱلنَّبِىَّ وَٱلَّذِينَ ءَامَنُوا۟ مَعَهُۥ ۖ نُورُهُمْ يَسْعَىٰ بَيْنَ أَيْدِيهِمْ وَبِأَيْمَـٰنِهِمْ يَقُولُونَ رَبَّنَآ أَتْمِمْ لَنَا نُورَنَا وَٱغْفِرْ لَنَآ ۖ إِنَّكَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ",
      english: "O believers! Turn to Allah in sincere repentance, so your Lord may absolve you of your sins and admit you into Gardens, under which rivers flow, on the Day Allah will not disgrace the Prophet or the believers with him. Their light will shine ahead of them and on their right. They will say, \u2018Our Lord! Perfect our light for us, and forgive us. You are truly Most Capable of everything.\u2019",
      surah: "Surah At-Tahrim (66:8)",
      reflection: [
        "Near the end of this verse there\u2019s an image that stays: people standing in light, their light already running ahead of them, and still asking \u2014 complete it for us, forgive us.",
        "Even then, in that state, the asking hasn\u2019t stopped. The reaching doesn\u2019t end even when much has already been given.",
      ],
    },
    {
      verseKey: "11:90",
      arabic: "وَٱسْتَغْفِرُوا۟ رَبَّكُمْ ثُمَّ تُوبُوٓا۟ إِلَيْهِ ۚ إِنَّ رَبِّى رَحِيمٌ وَدُودٌ",
      english: "So seek your Lord\u2019s forgiveness and turn to Him in repentance. Surely my Lord is Most Merciful, All-Loving.",
      surah: "Surah Hud (11:90)",
      reflection: [
        "The verse doesn\u2019t only name Allah as Merciful here \u2014 it adds Al-Wadood, the All-Loving. That word is quieter and closer.",
        "Returning to someone who loves you is different from returning to someone who only pardons. The door you\u2019re coming back through is not a cold one.",
      ],
    },
    {
      verseKey: "4:110",
      arabic: "وَمَن يَعْمَلْ سُوٓءًا أَوْ يَظْلِمْ نَفْسَهُۥ ثُمَّ يَسْتَغْفِرِ ٱللَّهَ يَجِدِ ٱللَّهَ غَفُورًا رَّحِيمًا",
      english: "Whoever commits evil or wrongs themselves then seeks Allah\u2019s forgiveness will certainly find Allah All-Forgiving, Most Merciful.",
      surah: "Surah An-Nisa (4:110)",
      reflection: [
        "This is a promise written out plainly: whoever does wrong \u2014 and then seeks forgiveness \u2014 will find it there.",
        "No exception listed. No condition on how bad, how often, or how long. Just the turning, and what\u2019s waiting on the other side of it.",
      ],
    },
  ],
  "seeking-strength": [
    {
      verseKey: "2:153",
      arabic: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ",
      english: "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.",
      surah: "Surah Al-Baqarah (2:153)",
      reflection: [
        "Two things are named here as the way to seek help: patience and prayer. Not because they make things easier immediately, but because Allah is with the patient.",
        "That presence is the ground to stand on \u2014 not a reward for enduring.",
      ],
    },
    {
      verseKey: "3:139",
      arabic: "وَلَا تَهِنُوا۟ وَلَا تَحْزَنُوا۟ وَأَنتُمُ ٱلْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
      english: "So do not weaken and do not grieve, and you will be superior if you are true believers.",
      surah: "Surah \u02beAli \u02bfImr\u0101n (3:139)",
      reflection: [
        "This came after a defeat. After real losses. And the word used isn\u2019t \u2018cheer up\u2019 \u2014 it\u2019s: do not weaken.",
        "Strength here isn\u2019t the absence of pain. It\u2019s the refusal to let pain become the last word.",
      ],
    },
    {
      verseKey: "8:46",
      arabic: "وَأَطِيعُوا۟ ٱللَّهَ وَرَسُولَهُۥ وَلَا تَنَـٰزَعُوا۟ فَتَفْشَلُوا۟ وَتَذْهَبَ رِيحُكُمْ ۖ وَٱصْبِرُوٓا۟ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ",
      english: "And obey Allah and His Messenger, and do not dispute and thus lose courage and your strength would depart; and be patient. Indeed, Allah is with the patient.",
      surah: "Surah Al-Anf\u0101l (8:46)",
      reflection: [
        "The verse names what drains strength before naming what builds it. Disputes scatter momentum \u2014 even from within.",
        "What holds things together is patience, and with patience comes the same assurance: Allah is with the patient.",
      ],
    },
    {
      verseKey: "47:7",
      arabic: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِن تَنصُرُوا۟ ٱللَّهَ يَنصُرْكُمْ وَيُثَبِّتْ أَقْدَامَكُمْ",
      english: "O you who have believed, if you support Allah, He will support you and plant firmly your feet.",
      surah: "Surah Mu\u1e25ammad (47:7)",
      reflection: [
        "The image here is specific: feet planted firmly. Not just support in general \u2014 but the kind of grounding that keeps you standing when things are unsteady.",
        "That firmness is what Allah gives to those who stand for Him.",
      ],
    },
    {
      verseKey: "94:7",
      arabic: "فَإِذَا فَرَغْتَ فَٱنصَبْ",
      english: "So when you have finished your duties, then stand up for worship.",
      surah: "Surah Ash-Shar\u1e25 (94:7)",
      reflection: [
        "When one thing is done, rise for the next. The verse doesn\u2019t promise stillness at the end of effort \u2014 it calls you back to movement.",
        "Not out of harshness, but because the one who keeps rising is the one who keeps being met.",
      ],
    },
  ],
  "seeking-clarity": [
    {
      verseKey: "17:36",
      arabic: "وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِۦ عِلْمٌ ۚ إِنَّ ٱلسَّمْعَ وَٱلْبَصَرَ وَٱلْفُؤَادَ كُلُّ أُو۟لَـٰٓئِكَ كَانَ عَنْهُ مَسْـُٔولًا",
      english: "And do not pursue that of which you have no knowledge. Indeed, the hearing, the sight and the heart \u2014 about all those one will be questioned.",
      surah: "Surah Al-Isr\u0101\u02be (17:36)",
      reflection: [
        "The verse draws a line between what you know and what you\u2019re only imagining. Not because uncertainty is wrong \u2014 but because there\u2019s a difference between sitting with a genuine question and building conclusions on guesswork.",
        "The heart, the eyes, the ears \u2014 they\u2019re instruments of knowing. What you feed them matters.",
      ],
    },
    {
      verseKey: "2:269",
      arabic: "يُؤْتِى ٱلْحِكْمَةَ مَن يَشَآءُ ۚ وَمَن يُؤْتَ ٱلْحِكْمَةَ فَقَدْ أُوتِىَ خَيْرًا كَثِيرًا ۗ وَمَا يَذَّكَّرُ إِلَّآ أُو۟لُوا۟ ٱلْأَلْبَـٰبِ",
      english: "He gives wisdom to whom He wills, and whoever has been given wisdom has certainly been given much good. And none will remember except those of understanding.",
      surah: "Surah Al-Baqarah (2:269)",
      reflection: [
        "Wisdom \u2014 the ability to see clearly, to know what something truly is \u2014 is described here as a gift given by Allah. Not a conclusion you arrive at alone.",
        "When clarity feels far, that\u2019s not a sign you\u2019re failing to think hard enough. It\u2019s an invitation to ask the One who gives it.",
      ],
    },
    {
      verseKey: "41:53",
      arabic: "سَنُرِيهِمْ ءَايَـٰتِنَا فِى ٱلْـَٔافَاقِ وَفِىٓ أَنفُسِهِمْ حَتَّىٰ يَتَبَيَّنَ لَهُمْ أَنَّهُ ٱلْحَقُّ ۗ أَوَلَمْ يَكْفِ بِرَبِّكَ أَنَّهُۥ عَلَىٰ كُلِّ شَىْءٍ شَهِيدٌ",
      english: "We will show them Our signs in the horizons and within themselves until it becomes clear to them that it is the truth. But is it not sufficient concerning your Lord that He is, over all things, a Witness?",
      surah: "Surah Fus\u0323s\u0323ilat (41:53)",
      reflection: [
        "The signs are in the world around you and inside you \u2014 both. Allah promises to show them, and to keep showing them, until the truth becomes clear.",
        "Clarity here isn\u2019t a single moment of arrival. It\u2019s something that unfolds as you pay attention.",
      ],
    },
    {
      verseKey: "3:190",
      arabic: "إِنَّ فِى خَلْقِ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ وَٱخْتِلَـٰفِ ٱلَّيْلِ وَٱلنَّهَارِ لَـَٔايَـٰتٍ لِّأُو۟لِى ٱلْأَلْبَـٰبِ\nٱلَّذِينَ يَذْكُرُونَ ٱللَّهَ قِيَـٰمًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِى خَلْقِ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ رَبَّنَا مَا خَلَقْتَ هَـٰذَا بَـٰطِلًا سُبْحَـٰنَكَ فَقِنَا عَذَابَ ٱلنَّارِ",
      english: "Indeed, in the creation of the heavens and the earth and the alternation of the night and the day are signs for those of understanding \u2014 those who remember Allah while standing or sitting or lying on their sides and give thought to the creation of the heavens and the earth, saying, \u2018Our Lord, You did not create this aimlessly; exalted are You; then protect us from the punishment of the Fire.\u2019",
      surah: "Surah \u02beAli \u02bfImr\u0101n (3:190\u2013191)",
      reflection: [
        "The people described here remember Allah in every position \u2014 standing, sitting, lying down \u2014 and they think deeply about what they see. The two practices together produce something: the recognition that nothing was made without purpose.",
        "Looking closely at what exists is itself a path toward seeing more clearly.",
      ],
    },
    {
      verseKey: "12:108",
      arabic: "قُلْ هَـٰذِهِۦ سَبِيلِىٓ أَدْعُوٓا۟ إِلَى ٱللَّهِ ۚ عَلَىٰ بَصِيرَةٍ أَنَا۠ وَمَنِ ٱتَّبَعَنِى ۖ وَسُبْحَـٰنَ ٱللَّهِ وَمَآ أَنَا۠ مِنَ ٱلْمُشْرِكِينَ",
      english: "Say, \u2018This is my way; I invite to Allah with insight, I and those who follow me. And exalted is Allah; and I am not of those who associate others with Him.\u2019",
      surah: "Surah Y\u016bsuf (12:108)",
      reflection: [
        "The word used here \u2014 baseerah \u2014 means a clarity of inner vision. The Prophet described his path as one walked with that quality.",
        "Not certainty about every detail, but a clear orientation: knowing who you are turning toward, and why. That kind of clarity doesn\u2019t require having all the answers.",
      ],
    },
  ],
  "seeking-reassurance": [
    {
      verseKey: "9:40",
      arabic: "إِلَّا تَنصُرُوهُ فَقَدْ نَصَرَهُ ٱللَّهُ إِذْ أَخْرَجَهُ ٱلَّذِينَ كَفَرُوا۟ ثَانِىَ ٱثْنَيْنِ إِذْ هُمَا فِى ٱلْغَارِ إِذْ يَقُولُ لِصَـٰحِبِهِۦ لَا تَحْزَنْ إِنَّ ٱللَّهَ مَعَنَا ۖ فَأَنزَلَ ٱللَّهُ سَكِينَتَهُۥ عَلَيْهِ وَأَيَّدَهُۥ بِجُنُودٍ لَّمْ تَرَوْهَا وَجَعَلَ كَلِمَةَ ٱلَّذِينَ كَفَرُوا۟ ٱلسُّفْلَىٰ ۗ وَكَلِمَةُ ٱللَّهِ هِىَ ٱلْعُلْيَا ۗ وَٱللَّهُ عَزِيزٌ حَكِيمٌ",
      english: "If you do not aid him \u2014 Allah has already aided him when those who disbelieved had driven him out as one of two, when they were in the cave and he said to his companion, \u2018Do not grieve; indeed Allah is with us.\u2019 And Allah sent down His tranquility upon him and supported him with soldiers you did not see and made the word of those who disbelieved the lowest, while the word of Allah \u2014 that is the highest. And Allah is Exalted in Might and Wise.",
      surah: "Surah At-Tawbah (9:40)",
      reflection: [
        "The Prophet said this in a cave, with enemies at the entrance. Not from safety, not from certainty about the outcome \u2014 but from knowing who was present.",
        "\u2018Do not grieve; Allah is with us.\u2019 That wasn\u2019t consolation. It was a fact he was standing on.",
      ],
    },
    {
      verseKey: "3:173",
      arabic: "ٱلَّذِينَ قَالَ لَهُمُ ٱلنَّاسُ إِنَّ ٱلنَّاسَ قَدْ جَمَعُوا۟ لَكُمْ فَٱخْشَوْهُمْ فَزَادَهُمْ إِيمَـٰنًا وَقَالُوا۟ حَسْبُنَا ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ",
      english: "Those to whom people said, \u2018Indeed, the people have gathered against you, so fear them.\u2019 But it merely increased them in faith, and they said, \u2018Sufficient for us is Allah, and He is the best Disposer of affairs.\u2019",
      surah: "Surah \u02beAli \u02bfImr\u0101n (3:173)",
      reflection: [
        "When they were warned that an army had gathered against them, the believers didn\u2019t minimize the threat. They acknowledged it \u2014 and then placed everything with Allah.",
        "\u2018He is sufficient for us.\u2019 Not wishful thinking. A position of trust taken in full awareness of what was coming.",
      ],
    },
    {
      verseKey: "65:3",
      arabic: "وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ ۚ إِنَّ ٱللَّهَ بَـٰلِغُ أَمْرِهِۦ ۚ قَدْ جَعَلَ ٱللَّهُ لِكُلِّ شَىْءٍ قَدْرًا",
      english: "And will provide for him from where he does not expect. And whoever relies upon Allah \u2014 then He is sufficient for him. Indeed, Allah will accomplish His purpose. Allah has already set for everything a decreed extent.",
      surah: "Surah At-Tal\u0101q (65:3)",
      reflection: [
        "Whoever places their reliance on Allah finds that He is sufficient. Not eventually, not partly \u2014 sufficient. Allah\u2019s purpose moves forward regardless of whether you can see the path.",
        "The outcome has already been set. Only the path is hidden.",
      ],
    },
    {
      verseKey: "21:87",
      arabic: "وَذَا ٱلنُّونِ إِذ ذَّهَبَ مُغَـٰضِبًا فَظَنَّ أَن لَّن نَّقْدِرَ عَلَيْهِ فَنَادَىٰ فِى ٱلظُّلُمَـٰتِ أَن لَّآ إِلَـٰهَ إِلَّآ أَنتَ سُبْحَـٰنَكَ إِنِّى كُنتُ مِنَ ٱلظَّـٰلِمِينَ",
      english: "And the man of the fish, when he went off in anger and thought that We would not decree anything upon him. And he called out within the darknesses, \u2018There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.\u2019",
      surah: "Surah Al-Anbiy\u0101\u02be (21:87)",
      reflection: [
        "Yunus called from three darknesses \u2014 the whale, the ocean, the night. He didn\u2019t claim innocence. He said: I have wronged.",
        "And from that place, from that admission, he was heard and brought out. The call didn\u2019t require perfection. It required turning.",
      ],
    },
    {
      verseKey: "2:214",
      arabic: "أَمْ حَسِبْتُمْ أَن تَدْخُلُوا۟ ٱلْجَنَّةَ وَلَمَّا يَأْتِكُم مَّثَلُ ٱلَّذِينَ خَلَوْا۟ مِن قَبْلِكُم ۖ مَّسَّتْهُمُ ٱلْبَأْسَآءُ وَٱلضَّرَّآءُ وَزُلْزِلُوا۟ حَتَّىٰ يَقُولَ ٱلرَّسُولُ وَٱلَّذِينَ ءَامَنُوا۟ مَعَهُۥ مَتَىٰ نَصْرُ ٱللَّهِ ۗ أَلَآ إِنَّ نَصْرَ ٱللَّهِ قَرِيبٌ",
      english: "Or do you think that you will enter Paradise while such trial has not yet come to you as came to those who passed on before you? They were touched by poverty and hardship and were shaken until even their messenger and those who believed with him said, \u2018When is the help of Allah?\u2019 Unquestionably, the help of Allah is near.",
      surah: "Surah Al-Baqarah (2:214)",
      reflection: [
        "Even the Prophet and those with him reached the point of asking: when? When will the help come? The verse doesn\u2019t dismiss that question.",
        "It answers it directly: the help of Allah is near. Not as a reminder to be patient \u2014 as a statement of where things already stand.",
      ],
    },
  ],
  "seeking-closeness": [
    {
      verseKey: "2:186",
      arabic: "وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ ٱلدَّاعِ إِذَا دَعَانِ ۖ فَلْيَسْتَجِيبُوا۟ لِى وَلْيُؤْمِنُوا۟ بِى لَعَلَّهُمْ يَرْشُدُونَ",
      english: "And when My servants ask you about Me \u2014 indeed I am near. I respond to the invocation of the supplicant when he calls upon Me. So let them respond to Me and believe in Me that they may be rightly guided.",
      surah: "Surah Al-Baqarah (2:186)",
      reflection: [
        "The question came through the Prophet: where is Allah? And the answer came directly from Allah Himself, without intermediary \u2014 I am near.",
        "Not when you\u2019re ready. Not after you\u2019ve prepared. Near. The door you\u2019re reaching toward is already open.",
      ],
    },
    {
      verseKey: "50:16",
      arabic: "وَلَقَدْ خَلَقْنَا ٱلْإِنسَـٰنَ وَنَعْلَمُ مَا تُوَسْوِسُ بِهِۦ نَفْسُهُۥ ۖ وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ ٱلْوَرِيدِ",
      english: "And We have already created man and know what his soul whispers to him, and We are closer to him than his jugular vein.",
      surah: "Surah Qaf (50:16)",
      reflection: [
        "You don\u2019t have to travel far to find closeness with Allah. He is already closer to you than the pulse in your own neck \u2014 closer than your own inner voice.",
        "The distance you feel is not the distance that is.",
      ],
    },
    {
      verseKey: "93:3",
      arabic: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ",
      english: "Your Lord has not taken leave of you, nor has He detested you.",
      surah: "Surah Ad-Duh\u0101 (93:3)",
      reflection: [
        "This verse came during a silence \u2014 a stretch when revelation had paused and the Prophet felt it. What arrived was not explanation, but reassurance: your Lord has not left you. He has not grown distant.",
        "The silence was not absence. It never was.",
      ],
    },
    {
      verseKey: "57:4",
      arabic: "هُوَ ٱلَّذِى خَلَقَ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ فِى سِتَّةِ أَيَّامٍ ثُمَّ ٱسْتَوَىٰ عَلَى ٱلْعَرْشِ ۚ يَعْلَمُ مَا يَلِجُ فِى ٱلْأَرْضِ وَمَا يَخْرُجُ مِنْهَا وَمَا يَنزِلُ مِنَ ٱلسَّمَآءِ وَمَا يَعْرُجُ فِيهَا ۖ وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ ۚ وَٱللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ",
      english: "It is He who created the heavens and earth in six days and then established Himself above the Throne. He knows what penetrates into the earth and what emerges from it and what descends from the heaven and what ascends therein; and He is with you wherever you are. And Allah, of what you do, is Seeing.",
      surah: "Surah Al-\u1e24ad\u012bd (57:4)",
      reflection: [
        "After describing all that Allah knows \u2014 what enters the earth, what leaves it, what descends, what rises \u2014 the verse lands here: and He is with you wherever you are.",
        "Not in spite of the distance. Not after you arrive somewhere. Wherever you are, already.",
      ],
    },
    {
      verseKey: "19:4",
      arabic: "قَالَ رَبِّ إِنِّى وَهَنَ ٱلْعَظْمُ مِنِّى وَٱشْتَعَلَ ٱلرَّأْسُ شَيْبًا وَلَمْ أَكُنۢ بِدُعَآئِكَ رَبِّ شَقِيًّا",
      english: "He said, \u2018My Lord, indeed my bones have weakened, and my head has filled with white, and never have I been in my supplication to You, my Lord, disappointed.\u2019",
      surah: "Surah Maryam (19:4)",
      reflection: [
        "Zakariyya came to his Lord old and worn \u2014 bones weakened, hair white. And he didn\u2019t start with his request. He started with his history: I have never called to You and been turned away.",
        "That\u2019s not a credential. It\u2019s a relationship. One built across years of reaching, and being met.",
      ],
    },
  ],
  "seeking-comfort": [
    {
      verseKey: "12:86",
      arabic: "قَالَ إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ وَأَعْلَمُ مِنَ اللَّهِ مَا لَا تَعْلَمُونَ",
      english: "He replied, \u2018I complain of my anguish and sorrow only to Allah, and I know from Allah what you do not know.\u2019",
      surah: "Surah Yusuf (12:86)",
      reflection: [
        "When Ya\u2019qub\u2019s sons grew tired of watching him grieve, he didn\u2019t argue his case. He just named where he was taking the pain \u2014 to Allah, and not to them.",
        "Not everything you carry is meant to be held by other people. Some pain has always belonged with Allah.",
      ],
    },
    {
      verseKey: "94:5",
      arabic: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا\nإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
      english: "So, surely with hardship comes ease. Surely with that hardship comes more ease.",
      surah: "Surah Ash-Sharh (94:5\u20136)",
      reflection: [
        "The ease isn\u2019t promised after \u2014 it\u2019s described as with. Present, alongside, already inside the same moment as the difficulty.",
        "The verse says it twice, which some understand as two instances of ease for every hardship. Whatever the count, the word stays the same: with. Not later. Not if. With.",
      ],
    },
    {
      verseKey: "13:28",
      arabic: "ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ",
      english: "Those who believe and whose hearts find comfort in the remembrance of Allah. Surely in the remembrance of Allah do hearts find comfort.",
      surah: "Surah Ar-Ra\u2019d (13:28)",
      reflection: [
        "The heart doesn\u2019t find rest after remembering \u2014 it finds rest in the act of remembering. The Arabic word used here means to settle, to grow still, the way water stops moving.",
        "Remembrance itself carries that quality \u2014 the verse doesn\u2019t explain why, it just names it clearly. This is where the heart comes home.",
      ],
    },
    {
      verseKey: "2:286",
      arabic: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا ٱكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَآ إِصْرًا كَمَا حَمَلْتَهُۥ عَلَى ٱلَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِۦ ۖ وَٱعْفُ عَنَّا وَٱغْفِرْ لَنَا وَٱرْحَمْنَآ ۚ أَنتَ مَوْلَىٰنَا فَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَـٰفِرِينَ",
      english: "Allah does not require of any soul more than what it can afford. All good will be for its own benefit, and all evil will be to its own loss. Our Lord! Do not punish us if we forget or make a mistake. Our Lord! Do not place a burden on us like the one you placed on those before us. Our Lord! Do not burden us with what we cannot bear. Pardon us, forgive us, and have mercy on us. You are our only Guardian. So grant us victory over the disbelieving people.",
      surah: "Surah Al-Baqarah (2:286)",
      reflection: [
        "Allah does not ask of a soul more than it can carry \u2014 that\u2019s the opening. What follows is a prayer He Himself taught: for forgiveness of forgetfulness, for the weight not to exceed what\u2019s bearable, for mercy.",
        "The comfort isn\u2019t only in the declaration. It\u2019s in being given the words to ask.",
      ],
    },
    {
      verseKey: "57:22",
      arabic: "مَآ أَصَابَ مِن مُّصِيبَةٍ فِى ٱلْأَرْضِ وَلَا فِىٓ أَنفُسِكُمْ إِلَّا فِى كِتَـٰبٍ مِّن قَبْلِ أَن نَّبْرَأَهَآ ۚ إِنَّ ذَٰلِكَ عَلَى ٱللَّهِ يَسِيرٌ",
      english: "No calamity befalls anyone in the world or in yourselves without being written in a Record before We bring it into being. This is certainly easy for Allah.",
      surah: "Surah Al-\u1e24ad\u012bd (57:22)",
      reflection: [
        "Nothing reaches you by accident. Whatever has come was already written before it arrived \u2014 before the world was made, before you were.",
        "That isn\u2019t cold \u2014 it\u2019s closeness. Allah knew what was coming before you did. What you\u2019re carrying has always been seen.",
      ],
    },
  ],
};

const defaultVerseData: VerseReflectionData = {
  verseKey: "94:6",
  arabic: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
  english: "Surely with that hardship comes more ease.",
  surah: "Surah Ash-Sharh (94:6)",
  reflection: [
    "The Qur\u2019an meets you here \u2014 not always with answers, but always with presence. And in that presence, you are not alone in what you carry.",
  ],
};

interface EmotionPageContentProps {
  emotion: Emotion;
}

export default function EmotionPageContent({ emotion }: EmotionPageContentProps) {
  const [journalOpen, setJournalOpen] = useState(false);
  const [quranOpen, setQuranOpen] = useState(false);
  const { saveEntry } = useJournal();

  // Audio state — keyed by verseKey
  const [activeVerse, setActiveVerse] = useState<string | null>(null);
  const [audioState, setAudioState] = useState<AudioState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const getOrCreateAudio = useCallback(() => {
    if (!audioRef.current) {
      const el = new Audio();
      audioRef.current = el;
    }
    return audioRef.current;
  }, []);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setActiveVerse(null);
    setAudioState("idle");
  }, []);

  const handleVerseTap = useCallback(
    async (verseKey: string) => {
      // Currently playing this verse → pause
      if (activeVerse === verseKey && audioState === "playing") {
        audioRef.current?.pause();
        setAudioState("paused");
        return;
      }

      // Currently paused on this verse → resume
      if (activeVerse === verseKey && audioState === "paused") {
        audioRef.current?.play();
        setAudioState("playing");
        return;
      }

      // Different verse or fresh play — stop old, start new
      stopAudio();
      setActiveVerse(verseKey);
      setAudioState("loading");

      try {
        const recitationId = await resolveMishariRecitationId();
        const url = await fetchAyahAudioUrl(verseKey, recitationId);

        const audio = getOrCreateAudio();
        audio.src = url;

        audio.onended = () => {
          setAudioState("idle");
          setActiveVerse(null);
        };
        audio.onerror = () => {
          setAudioState("error");
        };

        await audio.play();
        setAudioState("playing");
      } catch {
        setAudioState("error");
      }
    },
    [activeVerse, audioState, stopAudio, getOrCreateAudio]
  );

  const getStateForVerse = (verseKey: string): AudioState => {
    if (activeVerse !== verseKey) return "idle";
    return audioState;
  };

  const [verseData] = useState<VerseReflectionData>(() => {
    const pool = emotionVerseMap[emotion.slug] ?? [defaultVerseData];
    return pool[Math.floor(Math.random() * pool.length)];
  });
  const { verseKey, arabic, english, surah, reflection } = verseData;

  return (
    <section className="min-h-dvh px-5 py-12">
      {/* Back */}
      <div className="animate-fade-in mb-12">
        <Link
          href="/carry"
          className="inline-flex items-center gap-1.5 text-olive-muted hover:text-olive transition-colors duration-300 font-[family-name:var(--font-nunito)] text-sm font-medium tracking-wide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-3.5 h-3.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </Link>
      </div>

      {/* Emotion title */}
      <h1
        className="animate-reveal font-[family-name:var(--font-dm-serif)] text-4xl font-normal text-title-brown tracking-[0.01em] mb-12 text-center"
        style={{ animationDelay: "200ms" }}
      >
        {emotion.label}
      </h1>

      {/* Arabic verse card */}
      <div className="animate-reveal mb-10" style={{ animationDelay: "400ms" }}>
        <div className="relative rounded-2xl border border-olive/10 bg-cream-light/60 px-6 py-8 text-center">
          {/* Audio button — top right */}
          <div className="absolute top-3 right-3">
            <VerseAudioButton
              state={getStateForVerse(verseKey)}
              onTap={() => handleVerseTap(verseKey)}
            />
          </div>

          <p
            className="text-3xl leading-loose text-charcoal/80 mb-5 whitespace-pre-line"
            style={{ fontFamily: "var(--font-amiri), serif" }}
            dir="rtl"
            lang="ar"
          >
            {arabic}
          </p>
          <p className="font-[family-name:var(--font-cormorant)] text-lg text-charcoal-light font-light italic">
            &ldquo;{english}&rdquo;
          </p>
          <p className="mt-2 font-[family-name:var(--font-nunito)] text-xs text-olive-muted tracking-wide font-medium">
            {surah}
          </p>
        </div>
      </div>

      {/* Reflection block */}
      <div className="animate-reveal mb-4" style={{ animationDelay: "600ms" }}>
        <div className="rounded-2xl border border-olive/10 bg-cream-light/40 px-6 py-6">
          <h2 className="font-[family-name:var(--font-dm-serif)] text-lg font-normal text-olive mb-3">
            A moment of reflection
          </h2>
          {reflection.map((para, i) => (
            <p
              key={i}
              className={`font-[family-name:var(--font-nunito)] text-sm text-charcoal-light font-normal leading-relaxed${i > 0 ? " mt-3" : ""}`}
            >
              {para}
            </p>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="animate-reveal flex flex-col gap-2 w-full mx-auto" style={{ animationDelay: "800ms" }}>
        {/* Primary */}
        <button
          onClick={() => setJournalOpen(true)}
          className="w-full py-4 rounded-full border border-olive/30 bg-olive/5 font-[family-name:var(--font-dm-serif)] text-base font-normal text-olive hover:bg-olive hover:text-cream hover:border-olive transition-all duration-500 ease-in-out"
        >
          Journal how this made you feel
        </button>
        {/* Secondary row — equal 50/50, same total width as primary */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <button
            onClick={() => setQuranOpen(true)}
            className="w-full py-2.5 rounded-full border border-olive/20 font-[family-name:var(--font-nunito)] text-xs font-medium text-olive-muted hover:text-olive hover:border-olive/30 transition-all duration-500 ease-in-out"
          >
            Open in Qur&rsquo;an
          </button>
          <Link
            href="/carry"
            className="w-full py-2.5 rounded-full border border-olive/20 font-[family-name:var(--font-nunito)] text-xs font-medium text-charcoal-faint hover:text-charcoal hover:border-charcoal/20 transition-all duration-500 ease-in-out flex items-center justify-center"
          >
            Return
          </Link>
        </div>
      </div>

      {/* Bottom flourish */}
      <div className="mt-14 flex justify-center">
        <div className="w-12 h-px bg-olive/20 animate-fade-in" style={{ animationDelay: "1s" }} />
      </div>

      {/* Journal bottom sheet */}
      <JournalSheet
        open={journalOpen}
        onClose={() => setJournalOpen(false)}
        context={{
          emotionSlug: emotion.slug,
          emotionLabel: emotion.label,
          verseKey,
          verseArabic: arabic,
          verseTranslation: english,
        }}
        onSave={saveEntry}
      />

      {/* Qur'an overlay */}
      <QuranOverlay open={quranOpen} onClose={() => setQuranOpen(false)} verseKey={verseKey} />
    </section>
  );
}
