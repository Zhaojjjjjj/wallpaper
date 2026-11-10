// Minimal line portraits for the lyric style: three styles per artist, in
// the same single-weight stroke language as the rest of the poster system.
// The day's style rotates with the date. Paths are authored in a 240x240 box
// using only M/L/C commands (every number is an x/y coordinate) so the layout
// can scale and translate them uniformly. `accent` paths carry the one
// coloured detail per portrait.

export interface Portrait {
	lines: string[];
	accents: string[];
}

/** Mirror a path horizontally inside the 240 box (x becomes 240 - x). */
function mirrorX(d: string): string {
	let isX = true;
	return d.replace(/-?\d+(?:\.\d+)?/g, (token) => {
		const value = Number(token);
		const out = isX ? 240 - value : value;
		isX = !isX;
		return String(Math.round(out * 10) / 10);
	});
}

// 周杰伦 · 侧面 — cap dome, band, profile, eye, ear, shoulder.
const JAY_PROFILE_LINES = [
	"M 60 90 C 64 48, 98 24, 136 26 C 174 28, 200 54, 202 92",
	"M 60 90 C 96 80, 168 80, 202 92",
	"M 202 92 C 204 126, 198 158, 182 182 C 174 194, 170 206, 170 220",
	"M 60 92 C 57 106, 55 116, 52 126 C 50 133, 44 142, 45 148 C 46 152, 52 153, 55 151 C 53 157, 53 161, 55 164 C 52 168, 52 172, 55 175 C 53 182, 56 188, 63 189 C 63 198, 70 205, 81 206 C 110 209, 138 202, 156 188",
	"M 76 134 C 81 131, 88 131, 93 134",
	"M 144 128 C 154 126, 159 136, 151 146 C 146 151, 139 149, 138 142",
	"M 82 240 C 102 222, 138 214, 176 218 C 196 220, 212 228, 222 240",
];
const JAY_PROFILE_BRIM = "M 62 86 C 38 84, 18 90, 4 104 C 26 102, 48 96, 64 94 C 66 91, 65 88, 62 86";

export const PORTRAITS: Record<string, Portrait[]> = {
	"周杰伦": [
		// 1 — side profile, cap, accent brim.
		{ lines: JAY_PROFILE_LINES, accents: [JAY_PROFILE_BRIM] },
		// 2 — front face under a cap, a strip of piano keys along the bottom.
		{
			lines: [
				// cap dome
				"M 58 84 C 60 44, 88 24, 120 24 C 152 24, 180 44, 182 84",
				// face
				"M 64 96 C 62 134, 70 168, 88 186 C 104 200, 136 200, 152 186 C 170 168, 178 134, 176 96",
				// ears
				"M 64 118 C 56 116, 52 126, 58 134",
				"M 176 118 C 184 116, 188 126, 182 134",
				// half-lidded eyes
				"M 88 130 C 94 127, 101 127, 107 130",
				"M 133 130 C 139 127, 146 127, 152 130",
				// nose
				"M 120 138 C 118 148, 115 154, 113 158 C 116 161, 123 161, 126 158",
				// flat mouth
				"M 108 172 C 116 170, 124 170, 132 172",
				// piano keys: a closed strip, white divisions, black-key blocks
				"M 58 216 L 182 216",
				"M 58 236 L 182 236",
				"M 58 216 L 58 236",
				"M 182 216 L 182 236",
				"M 83 216 L 83 236",
				"M 108 216 L 108 236",
				"M 132 216 L 132 236",
				"M 157 216 L 157 236",
				"M 79 216 L 87 216 L 87 227 L 79 227 Z",
				"M 104 216 L 112 216 L 112 227 L 104 227 Z",
				"M 153 216 L 161 216 L 161 227 L 153 227 Z",
			],
			accents: [
				// brim seen from the front: a slim crescent
				"M 52 88 C 84 79, 156 79, 188 88 C 156 96, 84 96, 52 88",
			],
		},
		// 3 — the profile mirrored, cap off, headphones on (the producer).
		{
			lines: [
				mirrorX(JAY_PROFILE_LINES[0]),
				mirrorX(JAY_PROFILE_LINES[2]),
				mirrorX(JAY_PROFILE_LINES[3]),
				mirrorX(JAY_PROFILE_LINES[4]),
				mirrorX(JAY_PROFILE_LINES[6]),
			],
			accents: [
				// headphone band over the top
				"M 58 84 C 66 36, 88 16, 116 16 C 144 16, 166 40, 172 86",
				// ear cup
				"M 78 140 C 78 133, 83 128, 90 128 C 97 128, 102 133, 102 140 C 102 147, 97 152, 90 152 C 83 152, 78 147, 78 140",
			],
		},
	],

	"陈奕迅": [
		// 1 — front face, cloud of curly hair, singing into a hand mic.
		{
			lines: [
				"M 60 118 C 42 112, 34 92, 44 78 C 30 64, 40 42, 58 40 C 54 20, 76 8, 92 16 C 100 0, 124 0, 134 12 C 150 0, 172 8, 176 24 C 196 20, 208 38, 200 52 C 216 60, 218 82, 206 92 C 218 108, 208 126, 192 124",
				"M 62 116 C 60 152, 70 184, 92 200 C 108 211, 132 211, 148 200 C 170 184, 180 152, 178 118",
				"M 82 140 C 88 145, 97 145, 103 140",
				"M 137 140 C 143 145, 152 145, 158 140",
				"M 80 128 C 88 124, 98 124, 105 127",
				"M 135 127 C 142 124, 152 124, 160 128",
				"M 121 148 C 119 157, 116 163, 114 167 C 117 171, 124 171, 127 168",
				"M 108 186 C 112 179, 128 179, 132 186 C 128 193, 112 193, 108 186",
				"M 52 240 C 66 222, 92 214, 120 214 C 148 214, 174 222, 188 240",
			],
			accents: [
				"M 138 194 C 138 188, 143 184, 148 184 C 153 184, 158 188, 158 194 C 158 200, 153 204, 148 204 C 143 204, 138 200, 138 194",
				"M 155 201 C 163 211, 171 220, 177 229",
				"M 141 189 C 144 185, 152 185, 155 189",
				"M 140 196 C 144 192, 152 192, 156 196",
			],
		},
		// 2 — side profile, curls behind, a stand mic in front.
		{
			lines: [
				// curls along the top and back of the head
				"M 84 84 C 70 78, 66 60, 76 50 C 64 38, 74 20, 90 22 C 96 6, 118 2, 130 12 C 144 0, 166 6, 172 20 C 190 16, 202 32, 194 46 C 208 54, 208 74, 196 82 C 204 96, 196 110, 184 108",
				// back of the head down to the neck
				"M 184 108 C 186 140, 178 168, 162 184",
				// face profile: brow, nose, lips, chin, jaw
				"M 84 84 C 80 100, 78 110, 74 120 C 71 128, 64 136, 65 141 C 66 145, 72 145, 75 143 C 73 149, 73 153, 75 156 C 72 160, 72 164, 75 167 C 73 174, 77 180, 84 181 C 86 190, 94 196, 104 196 C 118 196, 132 192, 144 184",
				// closed eye
				"M 92 122 C 97 119, 104 119, 109 122",
				// mic stand
				"M 40 138 C 40 170, 40 200, 40 230",
				"M 26 234 C 34 231, 46 231, 54 234",
				// shoulder
				"M 108 240 C 124 224, 152 216, 184 220 C 198 222, 208 230, 216 240",
			],
			accents: [
				// mic head on the stand
				"M 30 128 C 30 121, 34 116, 40 116 C 46 116, 50 121, 50 128 C 50 135, 46 140, 40 140 C 34 140, 30 135, 30 128",
				"M 33 124 C 36 121, 44 121, 47 124",
			],
		},
		// 3 — front face, eyes open, broad smile, mic held low at the chest.
		{
			lines: [
				"M 60 118 C 42 112, 34 92, 44 78 C 30 64, 40 42, 58 40 C 54 20, 76 8, 92 16 C 100 0, 124 0, 134 12 C 150 0, 172 8, 176 24 C 196 20, 208 38, 200 52 C 216 60, 218 82, 206 92 C 218 108, 208 126, 192 124",
				"M 62 116 C 60 152, 70 184, 92 200 C 108 211, 132 211, 148 200 C 170 184, 180 152, 178 118",
				// open eyes: an arc plus a pupil dot
				"M 82 136 C 88 132, 97 132, 103 136",
				"M 91 141 C 91 139, 92 138, 94 138 C 96 138, 97 139, 97 141 C 97 143, 96 144, 94 144 C 92 144, 91 143, 91 141",
				"M 137 136 C 143 132, 152 132, 158 136",
				"M 146 141 C 146 139, 147 138, 149 138 C 151 138, 152 139, 152 141 C 152 143, 151 144, 149 144 C 147 144, 146 143, 146 141",
				// nose
				"M 121 148 C 119 157, 116 163, 114 167 C 117 171, 124 171, 127 168",
				// broad smile
				"M 100 184 C 108 193, 132 193, 140 184",
				// shoulders, broken for the mic at centre
				"M 40 240 C 54 224, 78 216, 102 214",
				"M 138 214 C 162 216, 186 224, 200 240",
			],
			accents: [
				// mic head low at the chest, handle running off the bottom
				"M 138 194 C 138 188, 143 184, 148 184 C 153 184, 158 188, 158 194 C 158 200, 153 204, 148 204 C 143 204, 138 200, 138 194",
				"M 155 201 C 163 211, 171 220, 177 229",
				"M 141 189 C 144 185, 152 185, 155 189",
				"M 140 196 C 144 192, 152 192, 156 196",
			],
		},
	],

	"赵雷": [
		// 1 — front face, beard, a big guitar held across the body.
		{
			lines: [
				// short hair (head drawn compact so the guitar has a torso to sit on)
				"M 70 84 C 66 50, 90 30, 116 30 C 142 30, 166 50, 162 84",
				// hairline
				"M 78 80 C 96 65, 136 65, 154 80",
				// face sides into the beard
				"M 70 84 C 68 108, 71 128, 77 141",
				"M 162 84 C 164 108, 161 128, 155 141",
				// beard
				"M 77 141 C 80 152, 86 157, 92 153 C 96 164, 106 168, 112 161 C 118 170, 130 170, 135 161 C 141 166, 149 162, 152 152 C 155 147, 155 143, 155 141",
				// calm eyes
				"M 85 101 C 90 98, 96 98, 101 101",
				"M 130 101 C 135 98, 141 98, 146 101",
				// nose
				"M 116 106 C 114 114, 111 120, 109 123 C 112 126, 118 126, 121 123",
				// mouth
				"M 104 134 C 110 137, 120 137, 126 134",
				// sound hole
				"M 110 202 C 110 197, 113 194, 118 194 C 123 194, 126 197, 126 202 C 126 207, 123 210, 118 210 C 113 210, 110 207, 110 202",
				// guitar neck up to the right, clear of the face, with its headstock
				"M 144 168 C 168 144, 192 118, 214 94",
				"M 153 177 C 176 154, 199 129, 220 106",
				"M 214 94 C 219 88, 225 84, 231 82",
			],
			accents: [
				// guitar body: a closed figure-eight low across the torso
				"M 118 158 C 138 158, 150 170, 148 186 C 147 192, 146 196, 148 202 C 156 214, 152 228, 138 236 C 128 241, 108 241, 98 236 C 84 228, 80 214, 88 202 C 90 196, 89 192, 88 186 C 86 170, 98 158, 118 158",
			],
		},

		// 2 — side profile facing right, beard scalloped along the jaw.
		{
			lines: [
				// one outline: skull, forehead, nose and lips, then the beard home
				"M 92 196 C 80 168, 76 128, 84 92 C 90 56, 118 32, 152 34 C 184 36, 202 62, 200 94 C 201 106, 205 115, 210 124 C 215 132, 220 140, 217 146 C 215 151, 208 151, 204 148 C 205 154, 205 158, 202 162 C 206 168, 204 176, 197 178 C 199 186, 193 193, 185 192 C 182 201, 170 204, 163 197 C 155 205, 141 203, 135 194 C 124 198, 112 193, 110 183 C 100 186, 94 190, 92 196",
				// eye
				"M 156 116 C 161 113, 168 113, 173 116",
				// ear
				"M 108 120 C 100 122, 98 132, 105 139",
				// neck and shoulders
				"M 100 240 C 106 224, 118 212, 136 206 C 158 200, 186 204, 206 218 C 214 224, 220 232, 224 240",
			],
			accents: [
				// one beard tuft picked out under the chin
				"M 163 197 C 155 205, 141 203, 135 194",
			],
		},
		// 3 — front face, eyes open, collar; guitar headstock over one shoulder.
		{
			lines: [
				"M 68 92 C 64 54, 90 32, 118 32 C 146 32, 172 54, 168 92",
				"M 76 88 C 96 72, 140 72, 160 88",
				"M 68 92 C 66 120, 69 142, 76 156",
				"M 168 92 C 170 120, 167 142, 160 156",
				"M 76 156 C 79 168, 86 173, 93 169 C 97 181, 108 186, 115 178 C 121 188, 133 188, 139 178 C 146 184, 155 179, 158 168 C 161 162, 161 158, 160 156",
				// open eyes
				"M 84 110 C 89 107, 96 107, 101 110",
				"M 90 115 C 90 113, 91 112, 93 112 C 95 112, 96 113, 96 115 C 96 117, 95 118, 93 118 C 91 118, 90 117, 90 115",
				"M 135 110 C 140 107, 147 107, 152 110",
				"M 141 115 C 141 113, 142 112, 144 112 C 146 112, 147 113, 147 115 C 147 117, 146 118, 144 118 C 142 118, 141 117, 141 115",
				"M 118 118 C 116 127, 113 133, 111 137 C 114 140, 120 140, 123 137",
				// wider smile
				"M 103 149 C 111 154, 125 154, 133 149",
				// shirt collar
				"M 92 204 C 104 216, 112 224, 118 234 C 124 224, 132 216, 144 204",
				// shoulders
				"M 36 240 C 52 220, 76 210, 100 206",
				"M 136 206 C 152 209, 168 215, 182 224",
				// guitar neck stub behind the right shoulder
				"M 190 238 C 198 222, 208 204, 218 188",
			],
			accents: [
				// headstock
				"M 218 188 C 222 180, 228 174, 234 170",
			],
		},
	],
};

export function getPortrait(artist: string, variantSeed = 0): Portrait {
	const variants = PORTRAITS[artist] ?? PORTRAITS["周杰伦"];
	const index = ((variantSeed % variants.length) + variants.length) % variants.length;
	return variants[index];
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
