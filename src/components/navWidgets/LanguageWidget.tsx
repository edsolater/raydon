import { useClickableElementRef } from '@/hooks/useClickableElement'
import useTranslation from '@/hooks/useTranslation'

import Menu from '../Menu'
import { Div, cssRow } from '@/../../uikit/dist'

function Item({ name = '', className, onClick }: { name?: string; className?: string; onClick?: () => void }) {
  const clickRef = useClickableElementRef({ onClick })
  return (
    <Div
      icss={cssRow()}
      className={`justify-between bg-ground-color-light p-4 rounded ${className ?? ''}`}
      domRef={clickRef}
    >
      <span>{name}</span>
    </Div>
  )
}

/** this should be used only in ./Navbar.tsx */
export default function LanguageWidget() {
  const { t, availableLanguages, changeLanguage } = useTranslation()
  return (
    <Menu>
      <Menu.Button>
        <button className="text-secondary h-full">{t['global|select language']}</button>
      </Menu.Button>
      {availableLanguages.map((name) => (
        <Menu.Item key={name}>
          <Item name={name} onClick={() => changeLanguage(name)} />
        </Menu.Item>
      ))}
    </Menu>
  )
}
