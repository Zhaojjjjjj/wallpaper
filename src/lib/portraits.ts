// Minimal line portraits for the lyric style, one per artist, drawn in the
// same single-weight stroke language as the rest of the poster system.
// Paths are authored in a 240x240 box using only M/L/C commands (every number
// is an x/y coordinate) so the layout can scale and translate them uniformly.
// `accent` paths carry the one coloured detail per portrait.

export interface Portrait {
	lines: string[];
	accents: string[];
}

export const PORTRAITS: Record<string, Portrait> = {
	// 周杰伦 — side profile facing left, cap with an accent brim.
	"周杰伦": {
		lines: [
			// cap dome
			"M 60 90 C 64 48, 98 24, 136 26 C 174 28, 200 54, 202 92",
			// cap band separating the cap from the face
			"M 60 90 C 96 80, 168 80, 202 92",
			// back of head down to the neck
			"M 202 92 C 204 126, 198 158, 182 182 C 174 194, 170 206, 170 220",
			// face profile: brow, nose, lips, chin, jaw
			"M 60 92 C 57 106, 55 116, 52 126 C 50 133, 44 142, 45 148 C 46 152, 52 153, 55 151 C 53 157, 53 161, 55 164 C 52 168, 52 172, 55 175 C 53 182, 56 188, 63 189 C 63 198, 70 205, 81 206 C 110 209, 138 202, 156 188",
			// eye
			"M 76 134 C 81 131, 88 131, 93 134",
			// ear
			"M 144 128 C 154 126, 159 136, 151 146 C 146 151, 139 149, 138 142",
			// shoulder / collar line
			"M 82 240 C 102 222, 138 214, 176 218 C 196 220, 212 228, 222 240",
		],
		accents: [
			// cap brim: a slim wedge reaching forward from the band
			"M 62 86 C 38 84, 18 90, 4 104 C 26 102, 48 96, 64 94 C 66 91, 65 88, 62 86",
		],
	},

	// 陈奕迅 — front face, a cloud of curly hair, singing into an accent mic.
	"陈奕迅": {
		lines: [
			// curly hair: one scalloped cloud around the top of the head
			"M 60 118 C 42 112, 34 92, 44 78 C 30 64, 40 42, 58 40 C 54 20, 76 8, 92 16 C 100 0, 124 0, 134 12 C 150 0, 172 8, 176 24 C 196 20, 208 38, 200 52 C 216 60, 218 82, 206 92 C 218 108, 208 126, 192 124",
			// face oval from under the hair
			"M 62 116 C 60 152, 70 184, 92 200 C 108 211, 132 211, 148 200 C 170 184, 180 152, 178 118",
			// closed singing eyes
			"M 82 140 C 88 145, 97 145, 103 140",
			"M 137 140 C 143 145, 152 145, 158 140",
			// brows
			"M 80 128 C 88 124, 98 124, 105 127",
			"M 135 127 C 142 124, 152 124, 160 128",
			// nose
			"M 121 148 C 119 157, 116 163, 114 167 C 117 171, 124 171, 127 168",
			// open singing mouth
			"M 108 186 C 112 179, 128 179, 132 186 C 128 193, 112 193, 108 186",
			// shoulders
			"M 52 240 C 66 222, 92 214, 120 214 C 148 214, 174 222, 188 240",
		],
		accents: [
			// microphone head on a short stand, low right
			"M 138 194 C 138 188, 143 184, 148 184 C 153 184, 158 188, 158 194 C 158 200, 153 204, 148 204 C 143 204, 138 200, 138 194",
			"M 155 201 C 163 211, 171 220, 177 229",
			"M 141 189 C 144 185, 152 185, 155 189",
			"M 140 196 C 144 192, 152 192, 156 196",
		],
	},

	// 赵雷 — front face with a full beard, acoustic guitar across the body.
	"赵雷": {
		lines: [
			// short hair
			"M 62 100 C 58 58, 86 34, 120 34 C 154 34, 182 58, 178 100",
			// face sides into the beard
			"M 62 100 C 60 128, 64 150, 72 164",
			"M 178 100 C 180 128, 176 150, 168 164",
			// beard: a wavy mass under the chin
			"M 72 164 C 76 178, 84 184, 92 180 C 96 194, 108 200, 116 192 C 122 204, 136 204, 142 192 C 150 199, 162 194, 164 182 C 170 176, 170 168, 168 164",
			// calm eyes
			"M 84 116 C 90 113, 97 113, 103 116",
			"M 137 116 C 143 113, 150 113, 156 116",
			// nose
			"M 120 122 C 118 132, 115 139, 113 143 C 116 147, 123 147, 126 144",
			// mouth, just above the beard
			"M 106 157 C 114 161, 126 161, 134 157",
			// hairline separating hair from forehead
			"M 74 96 C 96 80, 144 80, 166 96",
			// sound hole
			"M 170 204 C 170 200, 173 198, 176 198 C 179 198, 182 200, 182 204 C 182 208, 179 210, 176 210 C 173 210, 170 208, 170 204",
			// guitar neck up to the right
			"M 194 182 C 205 161, 216 141, 228 124",
			"M 228 124 C 231 120, 234 118, 238 117",
			// shoulders under the guitar
			"M 30 240 C 44 220, 72 210, 104 208",
		],
		accents: [
			// guitar body: a closed figure-eight, lower right
			"M 172 166 C 157 166, 147 179, 151 194 C 141 202, 141 221, 153 231 C 165 241, 187 241, 199 231 C 211 221, 211 202, 201 194 C 205 179, 195 166, 172 166",
		],
	},
};

export function getPortrait(artist: string): Portrait {
	return PORTRAITS[artist] ?? PORTRAITS["周杰伦"];
}

/** Scale (uniform) and translate an authored path; numbers alternate x, y. */
export function transformPath(d: string, scale: number, tx: number, ty: number): string {
	let isX = true;
	return d.replace(/-?\d+(?:\.\d+)?/g, (token) => {
		const value = Number(token);
		const out = isX ? value * scale + tx : value * scale + ty;
		isX = !isX;
		return String(Math.round(out * 10) / 10);
	});
}
