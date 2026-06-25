const fs = require('fs');

let content = fs.readFileSync('src/app/(dashboard)/dashboard/appearance/appearance-form.tsx', 'utf8');

const oldBlockStart = content.indexOf('<div style={{ background: \'var(--bg-muted)\', padding: \'var(--s-6)\', borderRadius: \'var(--r-lg)\', border: \'1px solid var(--border)\' }}>\n              <h3 style={{ fontSize: \'1.0625rem\', fontWeight: 600, marginBottom: \'var(--s-5)\' }}>Behavior</h3>');
const oldBlockEnd = content.indexOf('</div>\n          </div>\n        </div>\n\n        <div className="card-footer">');

if (oldBlockStart === -1 || oldBlockEnd === -1) {
  console.log("Could not find block to replace.");
  process.exit(1);
}

const replacement = `
            <div style={{ background: 'var(--bg-muted)', padding: 'var(--s-6)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--s-5)' }}>Behavior & Layout</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
                {/* Hover Animation Picker */}
                <div className="input-group">
                  <label className="input-label">Hover Animation</label>
                  <input type="hidden" name="hover_animation" value={theme.hover_animation} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {HOVER_ANIMATIONS.map((anim) => (
                      <button
                        key={anim.id}
                        type="button"
                        onClick={() => setTheme((prev: any) => ({ ...prev, hover_animation: anim.id }))}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--r-md)',
                          border: theme.hover_animation === anim.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: theme.hover_animation === anim.id ? 'var(--bg-accent-light, rgba(99, 102, 241, 0.08))' : 'var(--bg-base)',
                          color: theme.hover_animation === anim.id ? 'var(--primary)' : 'var(--text-secondary)',
                          fontWeight: theme.hover_animation === anim.id ? 600 : 400,
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          transition: 'all 150ms ease',
                          textAlign: 'center',
                        }}
                      >
                        {anim.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Picker */}
                <div className="input-group">
                  <label className="input-label">Widget Size</label>
                  <input type="hidden" name="size" value={theme.size} />
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px',
                  }}>
                    {SIZES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setTheme((prev: any) => ({ ...prev, size: s.id }))}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: 'var(--r-md)',
                          border: theme.size === s.id 
                            ? '2px solid var(--primary)' 
                            : '1px solid var(--border)',
                          background: theme.size === s.id 
                            ? 'var(--bg-accent-light, rgba(99, 102, 241, 0.08))' 
                            : 'var(--bg-base)',
                          color: theme.size === s.id 
                            ? 'var(--primary)' 
                            : 'var(--text-secondary)',
                          fontWeight: theme.size === s.id ? 600 : 400,
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          transition: 'all 150ms ease',
                          textAlign: 'center',
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position Picker */}
                <div className="input-group">
                  <label className="input-label">Widget Position</label>
                  <input type="hidden" name="position" value={theme.position} />
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '8px',
                  }}>
                    {POSITIONS.map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setTheme((prev: any) => ({ ...prev, position: pos.id }))}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--r-md)',
                          border: theme.position === pos.id 
                            ? '2px solid var(--primary)' 
                            : '1px solid var(--border)',
                          background: theme.position === pos.id 
                            ? 'var(--bg-accent-light, rgba(99, 102, 241, 0.08))' 
                            : 'var(--bg-base)',
                          color: theme.position === pos.id 
                            ? 'var(--primary)' 
                            : 'var(--text-secondary)',
                          fontWeight: theme.position === pos.id ? 600 : 400,
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          transition: 'all 150ms ease',
                          textAlign: 'center',
                        }}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animation Picker */}
                <div className="input-group">
                  <label className="input-label">Entry Animation</label>
                  <input type="hidden" name="slide_animation" value={theme.slide_animation} />
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '8px',
                  }}>
                    {ANIMATIONS.map((anim) => (
                      <button
                        key={anim.id}
                        type="button"
                        onClick={() => setTheme((prev: any) => ({ ...prev, slide_animation: anim.id }))}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--r-md)',
                          border: theme.slide_animation === anim.id 
                            ? '2px solid var(--primary)' 
                            : '1px solid var(--border)',
                          background: theme.slide_animation === anim.id 
                            ? 'var(--bg-accent-light, rgba(99, 102, 241, 0.08))' 
                            : 'var(--bg-base)',
                          color: theme.slide_animation === anim.id 
                            ? 'var(--primary)' 
                            : 'var(--text-secondary)',
                          fontWeight: theme.slide_animation === anim.id ? 600 : 400,
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          transition: 'all 150ms ease',
                          textAlign: 'center',
                        }}
                      >
                        {anim.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
`;

content = content.substring(0, oldBlockStart) + replacement + content.substring(oldBlockEnd);
fs.writeFileSync('src/app/(dashboard)/dashboard/appearance/appearance-form.tsx', content);
console.log("Restored");
